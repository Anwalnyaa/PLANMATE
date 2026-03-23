import supabase  from "../config/supabaseClient.js"

export async function getActivities(city) {

  const { data, error } = await supabase
    .from("v_activities_full")
    .select("*")
    .eq("city_name", city)

  if (error) throw error

  return data
}