import { types } from "../2_tl.ts";
import { FileID, FileType, FileUniqueID, FileUniqueType, ThumbnailSource } from "./0__file_id.ts";

/** @unlisted */
export interface _ChatPhotoBase {
  /** A file identifier that can be used to download or reuse the small version of the chat photo (160x160). */
  smallFileId: string;
  /** A file identifier that can be used to identify the small version of the chat photo (160x160). */
  smallFileUniqueId: string;
  /** A file identifier that can be used to download or reuse the big version of the chat photo (640x640). */
  bigFileId: string;
  /** A file identifier that can be used to identify the big version of the chat photo (640x640). */
  bigFileUniqueId: string;
  /** Whether the chat photo is animated. */
  hasVideo: boolean;
}

/** @unlisted */
export interface ChatPhotoUser extends _ChatPhotoBase {
  /** Differentiates between user profile photos. */
  personal: true;
}

/** @unlisted */
export type ChatPhotoChat = _ChatPhotoBase;

/** A chat photo. */
export type ChatPhoto = ChatPhotoUser | ChatPhotoChat;

export function constructChatPhoto(photo: types.ChatPhoto, chatId: number, chatAccessHash: bigint): ChatPhotoChat;
export function constructChatPhoto(photo: types.UserProfilePhoto, chatId: number, chatAccessHash: bigint): ChatPhotoUser;
export function constructChatPhoto(photo: types.UserProfilePhoto | types.ChatPhoto, chatId: number, chatAccessHash: bigint): ChatPhoto {
  const smallFileId = new FileID(null, null, FileType.ChatPhoto, photo.dc_id, {
    mediaId: photo.photo_id,
    thumbnailSource: ThumbnailSource.ChatPhotoSmall,
    chatId,
    chatAccessHash,
    accessHash: 0n,
    volumeId: 0n,
    localId: 0,
  }).encode();
  const smallFileUniqueId = new FileUniqueID(FileUniqueType.Document, { mediaId: photo.photo_id }).encode();
  const bigFileId = new FileID(null, null, FileType.ChatPhoto, photo.dc_id, {
    mediaId: photo.photo_id,
    thumbnailSource: ThumbnailSource.ChatPhotoBig,
    chatId,
    chatAccessHash,
    accessHash: 0n,
    volumeId: 0n,
    localId: 0,
  }).encode();
  const bigFileUniqueId = new FileUniqueID(FileUniqueType.Document, { mediaId: photo.photo_id }).encode();
  if (photo instanceof types.ChatPhoto) {
    return {
      smallFileId,
      smallFileUniqueId,
      bigFileId,
      bigFileUniqueId,
      hasVideo: photo.has_video || false,
    };
  } else {
    return {
      personal: photo.personal ? true : undefined,
      smallFileId,
      smallFileUniqueId,
      bigFileId,
      bigFileUniqueId,
      hasVideo: photo.has_video || false,
    };
  }
}
