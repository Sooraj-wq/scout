export const generateExplanation = (analysis) => {
  const { pattern, reasoning, subScores } = analysis;
  
  const sections = [];
  
  sections.push(generateStrengthSection(subScores));
  
  if (pattern === 'exposure_related') {
    sections.push(generateExposureRelatedSection(reasoning, subScores));
  } else if (pattern === 'possible_dyscalculia_signal') {
    sections.push(generateDyscalculiaSignalSection(reasoning, subScores));
  } else {
    sections.push(generateUnclearSection(reasoning, subScores));
  }
  
  sections.push(generateNextStepsSection(pattern, subScores));
  
  return sections.join('\n\n');
};

const generateStrengthSection = (subScores) => {
  const strengths = [];
  
  if (subScores.improvement > 0.15) {
    strengths.push('showed quick learning when given repeated chances');
  }
  if (subScores.quantity > 60) {
    strengths.push('demonstrated solid understanding of small quantities');
  }
  if (subScores.comparison > 60) {
    strengths.push('could reliably tell which groups were larger');
  }
  if (subScores.symbol > 50) {
    strengths.push('made connections between objects and symbols');
  }
  
  if (strengths.length === 0) {
    return 'The child engaged calmly with the number activities and showed willingness to participate.';
  }
  
  return 'The child ' + strengths.join(', ') + '.';
};

const generateExposureRelatedSection = (reasoning, subScores) => {
  let section = 'The child needed some time to become familiar with number activities, ';
  
  if (subScores.improvement > 0.2) {
    section += 'and once they had a few chances to explore, their understanding improved quickly. ';
  } else {
    section += 'which is common at this age when children are still building their number experiences. ';
  }
  
  section += 'This suggests that their number skills are still developing through experience. ';
  
  if (subScores.symbol < 50) {
    section += 'Symbols appeared to be less familiar than physical objects, which is typical for younger children. ';
  }
  
  return section;
};

const generateDyscalculiaSignalSection = (reasoning, subScores) => {
  let section = 'The child was comfortable with some number activities but began to struggle in specific areas. ';
  
  if (subScores.symbol < 40) {
    section += 'Difficulties with number symbols remained even after repeated practice, which suggests that numbers may not feel intuitive yet. ';
  } else if (subScores.quantity < 40) {
    section += 'Even small quantities were challenging to recognize consistently, which may indicate that number sense needs additional support. ';
  } else if (subScores.comparison < 40) {
    section += 'Comparing groups of objects remained difficult even with large differences between them. ';
  }
  
  section += 'These patterns suggest the child may benefit from learning approaches that use more visual, hands-on support. ';
  
  return section;
};

const generateUnclearSection = (reasoning, subScores) => {
  let section = 'The child showed a mix of strengths and challenges during the activities. ';
  
  if (subScores.improvement < 0.1) {
    section += 'Practice helped, but improvements were gradual. ';
  }
  
  section += 'More playful exposure to numbers in everyday situations would help build confidence and familiarity. ';
  
  return section;
};

const generateNextStepsSection = (pattern) => {
  let section = 'Suggestions for supporting number development:\n';
  
  section += '- Play counting games with everyday objects like toys, stairs, or snacks\n';
  
  if (pattern === 'exposure_related') {
    section += '- Point out numbers in books, signs, and around the home\n';
    section += '- Use hands-on activities like sorting, stacking, and building\n';
    section += '- Keep activities short, playful, and pressure-free\n';
  } else if (pattern === 'possible_dyscalculia_signal') {
    section += '- Use visual representations like dot patterns and number lines\n';
    section += '- Break number activities into very small, manageable steps\n';
    section += '- Allow extra time and provide reassurance during number activities\n';
    section += '- Consider speaking with a learning specialist for additional guidance\n';
  } else {
    section += '- Continue with playful, low-pressure number activities\n';
    section += '- Follow the child\'s interest and pace\n';
    section += '- Celebrate small successes and keep things fun\n';
  }
  
  return section;
};

export const generateBriefSummary = (analysis) => {
  const { pattern } = analysis;
  
  if (pattern === 'exposure_related') {
    return 'Number skills developing through experience. Continued playful exposure will help.';
  } else if (pattern === 'possible_dyscalculia_signal') {
    return 'Some number concepts remain challenging. Additional visual and hands-on support may help.';
  } else {
    return 'Showing gradual progress with number activities. More practice in playful contexts recommended.';
  }
};
