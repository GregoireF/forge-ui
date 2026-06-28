/** Loading status of the avatar image. */
export type AvatarImageStatus = "idle" | "loading" | "loaded" | "error";

/** Machine states mirror the image status for simplicity. */
export type AvatarState = AvatarImageStatus;

export interface AvatarContext {
  id: string;
  /** The image src URL. Updated via SRC_CHANGE event. */
  src: string | undefined;
  /** Alt text for the <img>. Used as accessible label when image loads. */
  alt: string;
  /**
   * Full name of the user — used to auto-generate initials (e.g. "John Doe" → "JD").
   * Exposed via the connect's `initials` property; rendering is left to the consumer.
   */
  name?: string;
  /** Optional callback invoked whenever the image loading status changes. */
  onStatusChange?: (status: AvatarImageStatus) => void;
}

export type AvatarEvent =
  | { type: "IMAGE_LOAD" }
  | { type: "IMAGE_ERROR" }
  | { type: "SRC_CHANGE"; src: string | undefined };

export type AvatarSend = (event: AvatarEvent | AvatarEvent["type"]) => void;

export interface CreateAvatarOptions {
  id?: string;
  /** The image URL to display. */
  src?: string;
  /** Accessible label — passed as alt on the img element. */
  alt?: string;
  /**
   * Full name of the user. The connect derives initials automatically.
   * e.g. "John Doe" → "JD", "Alice" → "A".
   */
  name?: string;
  /** Called when the image status changes. */
  onStatusChange?: (status: AvatarImageStatus) => void;
}
