export function scoreActivity(activity, preferences) {

  let score = 0

  score += activity.rating * 0.4

  score += activity.pref_food_lover * preferences.food * 0.2
  score += activity.pref_history_buff * preferences.culture * 0.2
  score += activity.pref_adventure * preferences.adventure * 0.1
  score += activity.pref_nightlife * preferences.nightlife * 0.1

  return score
}