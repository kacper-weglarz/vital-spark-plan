// TDEE & macro calculation based on user profile

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function calculateBMR(weight: number, height: number, age: number, isMale = true): number {
  // Mifflin-St Jeor
  if (isMale) return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
}

export function calculateTargets(
  weight: number,
  height: number,
  birthDate: string,
  activityLevel: string,
  goalType: string
): { calories: number; protein: number; carbs: number; fat: number } {
  const age = calculateAge(birthDate);
  const bmr = calculateBMR(weight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);

  let calories = tdee;
  if (goalType === 'cut') calories = Math.round(tdee * 0.8);
  else if (goalType === 'bulk') calories = Math.round(tdee * 1.15);

  // Protein: 2g/kg, Fat: 25% of calories, Carbs: rest
  const protein = Math.round(weight * 2);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein: Math.max(protein, 0), carbs: Math.max(carbs, 0), fat: Math.max(fat, 0) };
}

export function calculateBMI(weight: number, height: number): number {
  const h = height / 100;
  return weight / (h * h);
}
