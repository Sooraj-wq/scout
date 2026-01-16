from typing import List, Dict, Any
from .models import TaskAttempt, AnalysisResult


def analyze_patterns(attempts: List[TaskAttempt]) -> AnalysisResult:
    """Analyze task attempts to detect patterns in performance."""
    if len(attempts) < 3:
        return AnalysisResult(
            pattern="insufficient_data",
            confidence=0,
            reasoning="Not enough attempts to identify patterns yet.",
            sub_scores={},
        )

    quantity_attempts = [a for a in attempts if a.task_type == "quantity"]
    comparison_attempts = [a for a in attempts if a.task_type == "comparison"]
    symbol_attempts = [a for a in attempts if a.task_type == "symbol"]

    quantity_analysis = analyze_stability(quantity_attempts, "quantity")
    comparison_analysis = analyze_stability(comparison_attempts, "comparison")
    symbol_analysis = analyze_stability(symbol_attempts, "symbol")

    improvement_rates = [
        calculate_improvement_rate(quantity_attempts)
        if len(quantity_attempts) > 2
        else None,
        calculate_improvement_rate(comparison_attempts)
        if len(comparison_attempts) > 2
        else None,
        calculate_improvement_rate(symbol_attempts)
        if len(symbol_attempts) > 2
        else None,
    ]
    improvement_rates = [rate for rate in improvement_rates if rate is not None]

    avg_improvement = (
        sum(improvement_rates) / len(improvement_rates) if improvement_rates else 0
    )

    pattern = determine_pattern(
        quantity_analysis, comparison_analysis, symbol_analysis, avg_improvement
    )

    return AnalysisResult(
        pattern=pattern,
        confidence=min(len(attempts) / 10 + (1 if improvement_rates else 0), 0.95),
        reasoning=generate_reasoning(
            quantity_analysis, comparison_analysis, symbol_analysis, avg_improvement
        ),
        sub_scores={
            "quantity": quantity_analysis.get("score", 0),
            "comparison": comparison_analysis.get("score", 0),
            "symbol": symbol_analysis.get("score", 0),
            "improvement": avg_improvement,
        },
    )


def analyze_stability(attempts: List[TaskAttempt], task_type: str) -> Dict[str, Any]:
    """Analyze stability and error patterns in task attempts."""
    if not attempts:
        return {"score": 70, "stability": "no_data", "error_rate": 0, "avg_latency": 0}

    correct = [a for a in attempts if a.correct]
    error_rate = 1 - (len(correct) / len(attempts))

    error_consistency = calculate_error_consistency(attempts)
    latency_trend = calculate_latency_trend(attempts)

    score = 80
    score -= error_rate * 30
    score -= error_consistency * 10
    score += latency_trend * 5

    return {
        "score": max(20, min(100, score)),
        "stability": "consistent_errors" if error_consistency > 0.7 else "variable",
        "error_rate": error_rate,
        "avg_latency": sum(a.latency for a in attempts) / len(attempts),
        "error_consistency": error_consistency,
    }


def calculate_error_consistency(attempts: List[TaskAttempt]) -> float:
    """Calculate how consistent error patterns are."""
    errors = [a for a in attempts if not a.correct]
    if len(errors) < 2:
        return 0

    error_patterns = [f"{a.selected_answer}-{a.correct_answer}" for a in errors]
    pattern_counts = {}
    for pattern in error_patterns:
        pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1

    max_repeat = max(pattern_counts.values())
    return max_repeat / len(errors)


def calculate_latency_trend(attempts: List[TaskAttempt]) -> float:
    """Calculate whether response times are improving."""
    if len(attempts) < 3:
        return 0

    first_half = attempts[: len(attempts) // 2]
    second_half = attempts[len(attempts) // 2 :]

    first_avg = sum(a.latency for a in first_half) / len(first_half)
    second_avg = sum(a.latency for a in second_half) / len(second_half)

    return (first_avg - second_avg) / first_avg


def calculate_improvement_rate(attempts: List[TaskAttempt]) -> float:
    """Calculate rate of improvement over time."""
    if len(attempts) < 3:
        return 0

    sorted_attempts = sorted(attempts, key=lambda a: a.timestamp or 0)
    first_half = sorted_attempts[: len(sorted_attempts) // 2]
    second_half = sorted_attempts[len(sorted_attempts) // 2 :]

    first_correct = len([a for a in first_half if a.correct]) / len(first_half)
    second_correct = len([a for a in second_half if a.correct]) / len(second_half)

    return max(-1, min(1, second_correct - first_correct))


def determine_pattern(
    quantity: Dict, comparison: Dict, symbol: Dict, improvement: float
) -> str:
    """Determine the overall pattern from analysis results."""
    has_consistent_errors = (
        quantity.get("stability") == "consistent_errors"
        or comparison.get("stability") == "consistent_errors"
        or symbol.get("stability") == "consistent_errors"
    )

    has_low_improvement = improvement < 0.1
    has_high_errors = (
        quantity.get("error_rate", 0) > 0.4 or comparison.get("error_rate", 0) > 0.4
    )

    if has_consistent_errors and (has_low_improvement or has_high_errors):
        return "possible_dyscalculia_signal"

    if improvement > 0.2 or (not has_consistent_errors and not has_high_errors):
        return "exposure_related"

    return "unclear"


def generate_reasoning(
    quantity: Dict, comparison: Dict, symbol: Dict, improvement: float
) -> str:
    """Generate human-readable reasoning from analysis."""
    reasons = []

    if quantity.get("error_rate", 0) > 0.3:
        reasons.append("quantity recognition showed elevated error rates")
    if comparison.get("error_rate", 0) > 0.3:
        reasons.append("comparison tasks were frequently challenging")
    if symbol.get("error_rate", 0) > 0.4:
        reasons.append("symbol-based tasks were notably difficult")
    if quantity.get("stability") == "consistent_errors":
        reasons.append("quantity errors were consistent rather than variable")
    if symbol.get("stability") == "consistent_errors":
        reasons.append("symbol errors repeated in similar patterns")
    if improvement > 0.2:
        reasons.append("performance improved notably with practice")
    if improvement < 0.05:
        reasons.append("practice did not lead to noticeable improvement")

    return (
        "; ".join(reasons) + "."
        if reasons
        else "Performance was generally stable across tasks."
    )


def calculate_overall_score(attempts: List[TaskAttempt]) -> float:
    """Calculate overall performance score."""
    analysis = analyze_patterns(attempts)
    sub_scores = analysis.sub_scores

    score = 70
    score += sub_scores.get("improvement", 0) * 20

    avg_sub_score = (
        sub_scores.get("quantity", 0)
        + sub_scores.get("comparison", 0)
        + sub_scores.get("symbol", 0)
    ) / 3
    score = (score * 0.4) + (avg_sub_score * 0.6)

    return max(0, min(100, score))
