import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

export const { fontFamily: interFont } = loadInter("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const { fontFamily: spaceFont } = loadSpaceGrotesk("normal", {
  weights: ["700"],
  subsets: ["latin"],
});
