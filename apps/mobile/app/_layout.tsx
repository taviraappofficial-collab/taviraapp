import { Stack } from 'expo-router';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts as useInter,
} from '@expo-google-fonts/inter';
import {
  Manrope_700Bold,
  useFonts as useManrope,
} from '@expo-google-fonts/manrope';

export default function Layout() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_600SemiBold });
  const [manropeLoaded] = useManrope({ Manrope_700Bold });
  if (!interLoaded || !manropeLoaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
