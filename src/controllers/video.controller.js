import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].every((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const { _id } = req.user;
  const { videoFile, thumbnail: thumbnailFile } = req.files;

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoFile[0].path);
  const thumbnail = await uploadOnCloudinary(thumbnailFile[0].path);
  const { duration, url: videoUrl } = uploadedVideo;
  const { url: thumbnailUrl } = thumbnail;

  const video = await Video.create({
    title,
    description,
    owner: _id,
    duration,
    thumbnail: thumbnailUrl,
    videoFile: videoUrl,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $project: {
        __v: 0,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
            },
          },
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, "Video not found."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    return res.status(400).json(new ApiResponse(400, {}, "Video Not Found"));
  }
  const { thumbnail, videoFile } = video;

  await deleteFromCloudinary(thumbnail);
  await deleteFromCloudinary(videoFile);

  return res
    .status(204)
    .json(new ApiResponse(204, { a, b, video }, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    [{ $set: { isPublished: { $not: "$isPublished" } } }],
    { new: true }
  );

  if (!video) {
    return res.status(400).json(new ApiResponse(400, {}, "Video Not Found"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video Publish Status Update Successfull")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
