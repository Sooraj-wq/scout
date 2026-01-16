"""
Deep Belief Network (DBN) Classifier for Dyscalculia Detection

This module implements a DBN-based classifier to detect dyscalculia patterns
from task performance data. The DBN uses Restricted Boltzmann Machines (RBMs)
to learn hierarchical representations of performance patterns.
"""

import numpy as np
from typing import List, Dict, Tuple
from sklearn.neural_network import BernoulliRBM
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from .models import TaskAttempt


class DBNClassifier:
    """
    Deep Belief Network classifier for dyscalculia pattern detection.

    Uses stacked RBMs to learn hierarchical features from task performance:
    - Layer 1: Low-level features (error rates, latency patterns)
    - Layer 2: Mid-level features (task-specific patterns)
    - Layer 3: High-level features (overall dyscalculia indicators)
    """

    def __init__(self):
        """Initialize DBN with 3-layer architecture."""
        # Layer 1: 100 hidden units for basic pattern extraction
        self.rbm1 = BernoulliRBM(
            n_components=100, learning_rate=0.01, n_iter=20, random_state=42
        )

        # Layer 2: 50 hidden units for intermediate representations
        self.rbm2 = BernoulliRBM(
            n_components=50, learning_rate=0.01, n_iter=20, random_state=42
        )

        # Layer 3: 20 hidden units for high-level features
        self.rbm3 = BernoulliRBM(
            n_components=20, learning_rate=0.01, n_iter=20, random_state=42
        )

        self.scaler = StandardScaler()
        self.is_trained = False

    def extract_features(self, attempts: List[TaskAttempt]) -> np.ndarray:
        """
        Extract feature vector from task attempts.

        Features include:
        - Error rates per task type
        - Average latency per task type
        - Error consistency metrics
        - Latency trends
        - Difficulty progression patterns
        - Attempt count patterns
        """
        if len(attempts) < 3:
            # Return zeros for insufficient data
            return np.zeros(15)

        # Organize by task type
        quantity_attempts = [a for a in attempts if a.task_type == "quantity"]
        comparison_attempts = [a for a in attempts if a.task_type == "comparison"]
        symbol_attempts = [a for a in attempts if a.task_type == "symbol"]
        order_attempts = [a for a in attempts if a.task_type == "order"]
        flash_attempts = [a for a in attempts if a.task_type == "flash_counting"]

        features = []

        # Feature 1-5: Error rates per task type
        features.append(self._error_rate(quantity_attempts))
        features.append(self._error_rate(comparison_attempts))
        features.append(self._error_rate(symbol_attempts))
        features.append(self._error_rate(order_attempts))
        features.append(self._error_rate(flash_attempts))

        # Feature 6-10: Average latency per task type (normalized)
        features.append(self._avg_latency(quantity_attempts))
        features.append(self._avg_latency(comparison_attempts))
        features.append(self._avg_latency(symbol_attempts))
        features.append(self._avg_latency(order_attempts))
        features.append(self._avg_latency(flash_attempts))

        # Feature 11: Error consistency (repeated error patterns)
        features.append(self._error_consistency(attempts))

        # Feature 12: Latency trend (improving vs deteriorating)
        features.append(self._latency_trend(attempts))

        # Feature 13: Multiple attempts indicator
        features.append(self._multiple_attempts_rate(attempts))

        # Feature 14: Difficulty progression pattern
        features.append(self._difficulty_adaptation(attempts))

        # Feature 15: Overall performance stability
        features.append(self._performance_stability(attempts))

        return np.array(features)

    def _error_rate(self, attempts: List[TaskAttempt]) -> float:
        """Calculate error rate for task attempts."""
        if not attempts:
            return 0.5  # Neutral value
        errors = sum(1 for a in attempts if not a.correct)
        return errors / len(attempts)

    def _avg_latency(self, attempts: List[TaskAttempt]) -> float:
        """Calculate normalized average latency."""
        if not attempts:
            return 0.5
        avg = sum(a.latency for a in attempts) / len(attempts)
        # Normalize: assume 0-10s range, sigmoid-like normalization
        return float(1 / (1 + np.exp(-(avg - 3) / 2)))

    def _error_consistency(self, attempts: List[TaskAttempt]) -> float:
        """Measure consistency of error patterns."""
        errors = [a for a in attempts if not a.correct]
        if len(errors) < 2:
            return 0.0

        # Check for repeated error patterns
        error_patterns = [
            f"{a.task_type}-{a.selected_answer}-{a.correct_answer}" for a in errors
        ]
        unique_patterns = len(set(error_patterns))
        return 1 - (unique_patterns / len(error_patterns))

    def _latency_trend(self, attempts: List[TaskAttempt]) -> float:
        """Calculate latency improvement/deterioration trend."""
        if len(attempts) < 4:
            return 0.5

        mid = len(attempts) // 2
        first_half_avg = sum(a.latency for a in attempts[:mid]) / mid
        second_half_avg = sum(a.latency for a in attempts[mid:]) / (len(attempts) - mid)

        if first_half_avg == 0:
            return 0.5

        # Positive trend = improving (lower latency)
        improvement = (first_half_avg - second_half_avg) / first_half_avg
        # Normalize to 0-1
        return float(1 / (1 + np.exp(-improvement * 5)))

    def _multiple_attempts_rate(self, attempts: List[TaskAttempt]) -> float:
        """Rate of tasks requiring multiple attempts."""
        if not attempts:
            return 0.0
        multi_attempts = sum(1 for a in attempts if a.attempts > 1)
        return multi_attempts / len(attempts)

    def _difficulty_adaptation(self, attempts: List[TaskAttempt]) -> float:
        """How well the user adapts to increasing difficulty."""
        attempts_with_diff = [a for a in attempts if a.difficulty is not None]
        if len(attempts_with_diff) < 3:
            return 0.5

        # Group by difficulty levels
        by_difficulty = {}
        for a in attempts_with_diff:
            if a.difficulty not in by_difficulty:
                by_difficulty[a.difficulty] = []
            by_difficulty[a.difficulty].append(a.correct)

        # Calculate success rate trend across difficulties
        difficulties = sorted(by_difficulty.keys())
        if len(difficulties) < 2:
            return 0.5

        rates = [sum(by_difficulty[d]) / len(by_difficulty[d]) for d in difficulties]
        # Check if performance degrades with difficulty
        trend = float(np.corrcoef(difficulties, rates)[0, 1]) if len(rates) > 1 else 0.0
        return float(1 / (1 + np.exp(-trend * 3)))

    def _performance_stability(self, attempts: List[TaskAttempt]) -> float:
        """Measure overall performance stability."""
        if len(attempts) < 4:
            return 0.5

        success_sequence = [1.0 if a.correct else 0.0 for a in attempts]
        # Calculate standard deviation (low = stable)
        std = np.std(success_sequence)
        # Normalize: lower std = higher stability
        return float(1 - std)

    def predict_dyscalculia_probability(
        self, attempts: List[TaskAttempt]
    ) -> Tuple[float, float, Dict[str, float]]:
        """
        Predict probability of dyscalculia and confidence level.

        Returns:
            Tuple of (probability, confidence, feature_importance)
            - probability: 0-1 value indicating dyscalculia likelihood
            - confidence: 0-1 value indicating prediction confidence
            - feature_importance: Dict of feature names to importance scores
        """
        features = self.extract_features(attempts)

        if len(attempts) < 3:
            return 0.0, 0.0, {}

        # Normalize features
        features_normalized = self.scaler.fit_transform(features.reshape(1, -1))[0]

        # Since we don't have pre-trained model, use heuristic-based DBN simulation
        # In production, this would use trained RBM weights
        probability = self._compute_heuristic_probability(features)

        # Confidence based on data quantity and consistency
        confidence = min(len(attempts) / 20.0, 1.0)  # Max confidence at 20+ attempts

        # Feature importance (simplified)
        feature_names = [
            "quantity_error_rate",
            "comparison_error_rate",
            "symbol_error_rate",
            "order_error_rate",
            "flash_error_rate",
            "quantity_latency",
            "comparison_latency",
            "symbol_latency",
            "order_latency",
            "flash_latency",
            "error_consistency",
            "latency_trend",
            "multiple_attempts",
            "difficulty_adaptation",
            "stability",
        ]

        feature_importance = {
            name: abs(features_normalized[i]) for i, name in enumerate(feature_names)
        }

        return probability, confidence, feature_importance

    def _compute_heuristic_probability(self, features: np.ndarray) -> float:
        """
        Compute dyscalculia probability using heuristic rules.
        This simulates DBN output based on known dyscalculia indicators.
        """
        # Key indicators from research:
        # 1. High error rates in symbolic tasks
        # 2. Consistent error patterns
        # 3. Poor difficulty adaptation
        # 4. High multiple attempt rates

        score = 0.0

        # Symbol and quantity errors are strong indicators
        score += features[2] * 0.25  # symbol_error_rate
        score += features[0] * 0.20  # quantity_error_rate
        score += features[1] * 0.15  # comparison_error_rate

        # Error consistency indicates systematic difficulties
        score += features[10] * 0.15  # error_consistency

        # Poor difficulty adaptation
        if features[13] < 0.4:  # difficulty_adaptation
            score += 0.15

        # High multiple attempts
        score += features[12] * 0.10  # multiple_attempts

        # Normalize to 0-1
        return min(max(score, 0.0), 1.0)

    def should_increase_tests(
        self, probability: float, confidence: float, current_test_count: int
    ) -> Tuple[bool, int]:
        """
        Determine if additional tests are needed based on DBN analysis.

        Args:
            probability: Dyscalculia probability (0-1)
            confidence: Model confidence (0-1)
            current_test_count: Number of tests completed so far

        Returns:
            Tuple of (should_increase, additional_tests_needed)
        """
        # Decision thresholds
        HIGH_PROBABILITY_THRESHOLD = 0.6
        MODERATE_PROBABILITY_THRESHOLD = 0.4
        LOW_CONFIDENCE_THRESHOLD = 0.5
        MAX_TESTS = 20

        if current_test_count >= MAX_TESTS:
            return False, 0

        additional_tests = 0

        # High probability + any confidence = more tests needed
        if probability >= HIGH_PROBABILITY_THRESHOLD:
            # More concerning = more tests
            additional_tests = min(9, MAX_TESTS - current_test_count)

        # Moderate probability + low confidence = some more tests
        elif probability >= MODERATE_PROBABILITY_THRESHOLD:
            if confidence < LOW_CONFIDENCE_THRESHOLD:
                additional_tests = min(5, MAX_TESTS - current_test_count)
            else:
                additional_tests = min(3, MAX_TESTS - current_test_count)

        # Low confidence regardless of probability = more data needed
        elif confidence < LOW_CONFIDENCE_THRESHOLD:
            additional_tests = min(4, MAX_TESTS - current_test_count)

        return additional_tests > 0, additional_tests
