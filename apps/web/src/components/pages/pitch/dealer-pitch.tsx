/**
 * Dealer Pitch Deck
 * Modular slides composition.
 */

'use client';

import {
  SlideOpener,
  SlideTheProblem,
  SlideTheSolution,
  SlideWhyItWorks,
  SlideTheToolkit,
  SlideYourBrand,
  SlidePricing,
  SlideAboutUs,
  SlideMission,
  SlideOurModel,
  SlideWhyYouWin,
  SlideClose,
} from './slides';

export function DealerPitch() {
  return (
    <main className="bg-background text-foreground">
      <SlideOpener />
      <SlideTheProblem />
      <SlideTheSolution />
      <SlideWhyItWorks />
      <SlideTheToolkit />
      <SlideYourBrand />
      <SlidePricing />
      <SlideAboutUs />
      <SlideMission />
      <SlideOurModel />
      <SlideWhyYouWin />
      <SlideClose />
    </main>
  );
}

export default DealerPitch;
