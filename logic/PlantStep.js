// ---------------------------------------------------------------------------
// 3. PLANTING STEPS  (ordered, built from whichever fields exist)
// ---------------------------------------------------------------------------

export function buildPlantingSteps(care) {
  const steps = [];
  const { light, soil, ph, temp, growth } = care;

  // Step 1 — location
  if (light) {
    steps.push({
      title: 'Choose the spot',
      detail: `${light.placement} Aim for about ${light.hours} hours of sunlight.`,
    });
  } else {
    steps.push({
      title: 'Choose the spot',
      detail: 'Pick a spot with morning sun and some afternoon shade.',
    });
  }

  // Step 2 — soil preparation
  const prep = soil?.prepStep ?? 'Loosen the soil and mix in compost.';
  const amend = ph?.amendment ? ` ${ph.amendment}` : '';
  steps.push({ title: 'Prepare the soil', detail: prep + amend });

  // Step 3 — depth and spacing
  const depth = growth?.minRootDepthCm;
  const spacing = growth?.rowSpacingCm;
  let detail = 'Dig a hole twice as wide as the root ball.';
  if (depth) detail += ` Soil should be at least ${depth} cm deep.`;
  if (spacing) detail += ` Leave ${spacing} cm between plants.`;
  steps.push({ title: 'Dig and space', detail });

  // Step 4 — planting time
  if (growth?.growthMonths?.length) {
    steps.push({
      title: 'Plant at the right time',
      detail: `Best planted during its active growth months: ${growth.growthMonths.join(', ')}.`,
    });
  }

  // Step 5 — first watering
  steps.push({
    title: 'Water in',
    detail: 'Water deeply right after planting so the soil settles around the roots.',
  });

  // Step 6 — aftercare
  if (temp?.maxTemp != null && temp.maxTemp <= 30) {
    steps.push({
      title: 'Shade for the first week',
      detail: 'Cover with light shade cloth while the plant settles in.',
    });
  }
  if (growth?.daysToHarvest) {
    steps.push({
      title: 'Expect harvest',
      detail: `Roughly ${growth.daysToHarvest} days from planting to harvest.`,
    });
  }

  return steps;
}