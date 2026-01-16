from typing import Dict, Any, List
from .models import AnalysisResult


def generate_explanation_text(
    analysis: AnalysisResult, exposures: List[Dict[str, Any]]
) -> str:
    """Generate human-readable explanation from analysis results."""
    sections = []

    sections.append(generate_strength_section(analysis.sub_scores))
    sections.append(
        generate_main_section(analysis.pattern, analysis.reasoning, analysis.sub_scores)
    )
    sections.append(generate_next_steps_section(analysis.pattern))

    return "\n\n".join(sections)


def generate_strength_section(sub_scores: Dict[str, float]) -> str:
    """Generate section highlighting child's strengths."""
    strengths = []

    if sub_scores.get("improvement", 0) > 0.15:
        strengths.append("showed quick learning when given repeated chances")
    if sub_scores.get("quantity", 0) > 60:
        strengths.append("demonstrated solid understanding of small quantities")
    if sub_scores.get("comparison", 0) > 60:
        strengths.append("could reliably tell which groups were larger")
    if sub_scores.get("symbol", 0) > 50:
        strengths.append("made connections between objects and symbols")

    if not strengths:
        return "The child engaged calmly with the number activities and showed willingness to participate."

    return "The child " + ", ".join(strengths) + "."


def generate_main_section(
    pattern: str, reasoning: str, sub_scores: Dict[str, float]
) -> str:
    """Generate main section describing observed patterns."""
    if pattern == "exposure_related":
        section = (
            "The child needed some time to become familiar with number activities, "
        )
        if sub_scores.get("improvement", 0) > 0.2:
            section += "and once they had a few chances to explore, their understanding improved quickly. "
        else:
            section += "which is common at this age when children are still building their number experiences. "
        section += "This suggests that their number skills are still developing through experience. "
        if sub_scores.get("symbol", 0) < 50:
            section += "Symbols appeared to be less familiar than physical objects, which is typical for younger children. "
        return section

    elif pattern == "possible_dyscalculia_signal":
        section = "The child was comfortable with some number activities but began to struggle in specific areas. "
        if sub_scores.get("symbol", 0) < 40:
            section += "Difficulties with number symbols remained even after repeated practice, which suggests that numbers may not feel intuitive yet. "
        elif sub_scores.get("quantity", 0) < 40:
            section += "Even small quantities were challenging to recognize consistently, which may indicate that number sense needs additional support. "
        elif sub_scores.get("comparison", 0) < 40:
            section += "Comparing groups of objects remained difficult even with large differences between them. "
        section += "These patterns suggest the child may benefit from learning approaches that use more visual, hands-on support. "
        return section

    else:
        section = (
            "The child showed a mix of strengths and challenges during the activities. "
        )
        if sub_scores.get("improvement", 0) < 0.1:
            section += "Practice helped, but improvements were gradual. "
        section += "More playful exposure to numbers in everyday situations would help build confidence and familiarity. "
        return section


def generate_next_steps_section(pattern: str) -> str:
    """Generate section with recommendations."""
    section = "Suggestions for supporting number development:\n"

    section += (
        "- Play counting games with everyday objects like toys, stairs, or snacks\n"
    )

    if pattern == "exposure_related":
        section += "- Point out numbers in books, signs, and around the home\n"
        section += "- Use hands-on activities like sorting, stacking, and building\n"
        section += "- Keep activities short, playful, and pressure-free\n"
    elif pattern == "possible_dyscalculia_signal":
        section += "- Use visual representations like dot patterns and number lines\n"
        section += "- Break number activities into very small, manageable steps\n"
        section += (
            "- Allow extra time and provide reassurance during number activities\n"
        )
        section += (
            "- Consider speaking with a learning specialist for additional guidance\n"
        )
    else:
        section += "- Continue with playful, low-pressure number activities\n"
        section += "- Follow the child's interest and pace\n"
        section += "- Celebrate small successes and keep things fun\n"

    return section
