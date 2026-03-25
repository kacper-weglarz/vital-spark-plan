import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';

// ─── Profile ───
export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const update = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', user?.id] }),
  });

  return { profile: query.data, isLoading: query.isLoading, updateProfile: update.mutate };
}

// ─── Products ───
export function useProducts() {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return { products: query.data ?? [], isLoading: query.isLoading };
}

// ─── Meals ───
export function useMeals(date: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['meals', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', date)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMeal = useMutation({
    mutationFn: async (meal: {
      product_name: string;
      product_id?: string;
      meal_type: string;
      quantity: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      date: string;
    }) => {
      const { error } = await supabase
        .from('meals')
        .insert({ ...meal, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  });

  const removeMeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  });

  return { meals: query.data ?? [], isLoading: query.isLoading, addMeal: addMeal.mutate, removeMeal: removeMeal.mutate };
}

// ─── Body Measurements ───
export function useBodyMeasurements() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['body_measurements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user!.id)
        .order('date');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMeasurement = useMutation({
    mutationFn: async (m: Record<string, any>) => {
      const { error } = await supabase
        .from('body_measurements')
        .insert({ ...m, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['body_measurements'] }),
  });

  return { measurements: query.data ?? [], isLoading: query.isLoading, addMeasurement: addMeasurement.mutate };
}

// ─── Training Plans ───
export function useTrainingPlans() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['training_plans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*, plan_exercises(*)')
        .eq('user_id', user!.id)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addPlan = useMutation({
    mutationFn: async (plan: { name: string; exercises: { name: string; sets: number; reps: number; rest_time: number; weight: number }[] }) => {
      const { data, error } = await supabase
        .from('training_plans')
        .insert({ name: plan.name, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;

      if (plan.exercises.length > 0) {
        const { error: exErr } = await supabase
          .from('plan_exercises')
          .insert(plan.exercises.map((e, i) => ({ ...e, plan_id: data.id, sort_order: i })));
        if (exErr) throw exErr;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training_plans'] }),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, name, exercises }: { id: string; name: string; exercises: { name: string; sets: number; reps: number; rest_time: number; weight: number }[] }) => {
      const { error } = await supabase.from('training_plans').update({ name }).eq('id', id);
      if (error) throw error;
      // Replace exercises
      await supabase.from('plan_exercises').delete().eq('plan_id', id);
      if (exercises.length > 0) {
        const { error: exErr } = await supabase
          .from('plan_exercises')
          .insert(exercises.map((e, i) => ({ ...e, plan_id: id, sort_order: i })));
        if (exErr) throw exErr;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training_plans'] }),
  });

  const removePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('training_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training_plans'] }),
  });

  return {
    plans: query.data ?? [],
    isLoading: query.isLoading,
    addPlan: addPlan.mutate,
    updatePlan: updatePlan.mutate,
    removePlan: removePlan.mutate,
  };
}

// ─── Workouts (completed sessions) ───
export function useWorkouts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['workouts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addWorkout = useMutation({
    mutationFn: async (w: { name: string; date: string; duration: number; completed: boolean; plan_id?: string }) => {
      const { error } = await supabase.from('workouts').insert({ ...w, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });

  return { workouts: query.data ?? [], isLoading: query.isLoading, addWorkout: addWorkout.mutate };
}

// ─── Scheduled Workouts ───
export function useScheduledWorkouts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['scheduled_workouts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const schedule = useMutation({
    mutationFn: async ({ date, planId }: { date: string; planId: string }) => {
      // upsert by user+date
      const { error } = await supabase
        .from('scheduled_workouts')
        .upsert({ date, plan_id: planId, user_id: user!.id }, { onConflict: 'user_id,date' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduled_workouts'] }),
  });

  const removeSchedule = useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('user_id', user!.id)
        .eq('date', date);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduled_workouts'] }),
  });

  return {
    scheduled: query.data ?? [],
    isLoading: query.isLoading,
    scheduleWorkout: schedule.mutate,
    removeSchedule: removeSchedule.mutate,
  };
}
