/**
 * Analytics placeholder for future Vercel Web Analytics + custom events.
 * Intentionally a NO-OP: nothing is transmitted in this prototype.
 * Event names here are provisional until the Analytics Event Dictionary is approved.
 * Never pass content (journal text, artwork, search queries, identifiers) as properties.
 */
export type EngagementRange = "<30s" | "30s-2m" | "2-5m" | "5-10m" | "10m+";

export type PortalEvent =
  | "landing_opened"
  | "area_visited"
  | "quick_exit_selected"
  | "art_room_opened"
  | "art_exercise_started"
  | "art_stage_reached"
  | "art_exercise_completed"
  | "recovery_room_opened"
  | "recovery_exercise_started"
  | "recovery_exercise_completed"
  | "calm_media_opened"
  | "calm_media_play"
  | "calm_media_pause"
  | "calm_captions_toggled"
  | "library_opened"
  | "library_category_opened"
  | "library_resource_opened"
  | "opportunity_category_opened"
  | "opportunity_viewed"
  | "external_link_selected"
  | "save_action"
  | "language_english_selected"
  | "language_spanish_selected"
  | "accessibility_control_used";

export function track(_event: PortalEvent, _props?: Record<string, string | boolean>) {
  // Intentionally empty. Wire to @vercel/analytics `track()` only after approval.
}
