"use client"

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react"
import type {
  FittingGarment,
  FittingRoomStatus,
  TryOnResult,
  UserImageState,
} from "@/lib/virtual-fitting/types"
import { fileToBase64, resolveUserImageMime } from "@/lib/virtual-fitting/validate-user-image"
import { submitVirtualTryOn, VirtualFittingError } from "@/lib/virtual-fitting/client-service"

type FittingRoomState = {
  isOpen: boolean
  garments: FittingGarment[]
  selectedGarmentId: string | null
  userImage: UserImageState | null
  status: FittingRoomStatus
  progress: number
  result: TryOnResult | null
  error: string | null
}

type OpenOptions = {
  garments: FittingGarment[]
  initialGarmentId?: string
}

type FittingRoomContextValue = {
  isOpen: boolean
  garments: FittingGarment[]
  selectedGarment: FittingGarment | null
  userImage: UserImageState | null
  status: FittingRoomStatus
  progress: number
  result: TryOnResult | null
  error: string | null
  openFittingRoom: (options: OpenOptions) => void
  closeFittingRoom: () => void
  resetFittingRoom: () => void
  selectGarment: (garmentId: string) => void
  setUserImage: (image: UserImageState | null) => void
  runTryOn: (isAr: boolean) => Promise<void>
}

const initialState: FittingRoomState = {
  isOpen: false,
  garments: [],
  selectedGarmentId: null,
  userImage: null,
  status: "idle",
  progress: 0,
  result: null,
  error: null,
}

type Action =
  | { type: "OPEN"; garments: FittingGarment[]; initialGarmentId?: string }
  | { type: "CLOSE" }
  | { type: "RESET" }
  | { type: "SELECT_GARMENT"; garmentId: string }
  | { type: "SET_USER_IMAGE"; userImage: UserImageState | null }
  | { type: "SET_STATUS"; status: FittingRoomStatus }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_RESULT"; result: TryOnResult }
  | { type: "SET_ERROR"; error: string | null }

function revokePreview(state: FittingRoomState) {
  if (state.userImage?.previewUrl) {
    URL.revokeObjectURL(state.userImage.previewUrl)
  }
}

function reducer(state: FittingRoomState, action: Action): FittingRoomState {
  switch (action.type) {
    case "OPEN": {
      revokePreview(state)
      const initialId =
        action.initialGarmentId && action.garments.some((g) => g.id === action.initialGarmentId)
          ? action.initialGarmentId
          : action.garments[0]?.id ?? null
      return {
        ...initialState,
        isOpen: true,
        garments: action.garments,
        selectedGarmentId: initialId,
      }
    }
    case "CLOSE":
      revokePreview(state)
      return { ...initialState }
    case "RESET":
      revokePreview(state)
      return {
        ...state,
        userImage: null,
        status: "idle",
        progress: 0,
        result: null,
        error: null,
      }
    case "SELECT_GARMENT":
      return { ...state, selectedGarmentId: action.garmentId, result: null, error: null, status: "idle" }
    case "SET_USER_IMAGE":
      if (state.userImage?.previewUrl && state.userImage.previewUrl !== action.userImage?.previewUrl) {
        URL.revokeObjectURL(state.userImage.previewUrl)
      }
      return { ...state, userImage: action.userImage, error: null }
    case "SET_STATUS":
      return { ...state, status: action.status }
    case "SET_PROGRESS":
      return { ...state, progress: action.progress }
    case "SET_RESULT":
      return { ...state, result: action.result, status: "completed", progress: 100, error: null }
    case "SET_ERROR":
      if (!action.error) return { ...state, error: null }
      return { ...state, error: action.error, status: "error" }
    default:
      return state
  }
}

const FittingRoomContext = createContext<FittingRoomContextValue | null>(null)

export function FittingRoomProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const selectedGarment = useMemo(
    () => state.garments.find((g) => g.id === state.selectedGarmentId) ?? null,
    [state.garments, state.selectedGarmentId]
  )

  const openFittingRoom = useCallback((options: OpenOptions) => {
    dispatch({ type: "OPEN", garments: options.garments, initialGarmentId: options.initialGarmentId })
  }, [])

  const closeFittingRoom = useCallback(() => dispatch({ type: "CLOSE" }), [])
  const resetFittingRoom = useCallback(() => dispatch({ type: "RESET" }), [])

  const selectGarment = useCallback((garmentId: string) => {
    dispatch({ type: "SELECT_GARMENT", garmentId })
  }, [])

  const setUserImage = useCallback((userImage: UserImageState | null) => {
    dispatch({ type: "SET_USER_IMAGE", userImage })
  }, [])

  const runTryOn = useCallback(
    async (isAr: boolean) => {
      if (!state.userImage || !selectedGarment) {
        dispatch({
          type: "SET_ERROR",
          error: isAr ? "ارفع صورتك واختر قطعة ملابس" : "Upload your photo and select a garment",
        })
        return
      }

      const photoMime = resolveUserImageMime(state.userImage.file)
      if (!photoMime) {
        dispatch({
          type: "SET_ERROR",
          error: isAr ? "صيغة الصورة غير مدعومة" : "Unsupported image format",
        })
        return
      }

      dispatch({ type: "SET_ERROR", error: null })
      dispatch({ type: "SET_STATUS", status: "uploading" })
      dispatch({ type: "SET_PROGRESS", progress: 12 })

      try {
        const base64 = await fileToBase64(state.userImage.file)
        dispatch({ type: "SET_STATUS", status: "processing" })
        dispatch({ type: "SET_PROGRESS", progress: 35 })

        let simulated = 35
        const progressTimer = window.setInterval(() => {
          simulated = Math.min(92, simulated + 4)
          dispatch({ type: "SET_PROGRESS", progress: simulated })
        }, 900)

        try {
          const result = await submitVirtualTryOn({
            userImageBase64: base64,
            userImageMimeType: photoMime,
            garmentImageUrl: selectedGarment.imageUrl,
            garmentId: selectedGarment.id,
          })
          dispatch({ type: "SET_RESULT", result })
        } finally {
          window.clearInterval(progressTimer)
        }
      } catch (error) {
        const message =
          error instanceof VirtualFittingError
            ? error.code === "TIMEOUT"
              ? isAr
                ? "انتهت مهلة المعالجة — حاول مجدداً"
                : "Processing timed out — please try again"
              : error.message
            : isAr
              ? "فشلت عملية القياس الافتراضي"
              : "Virtual try-on failed"
        dispatch({ type: "SET_ERROR", error: message })
      }
    },
    [selectedGarment, state.userImage]
  )

  const value = useMemo<FittingRoomContextValue>(
    () => ({
      isOpen: state.isOpen,
      garments: state.garments,
      selectedGarment,
      userImage: state.userImage,
      status: state.status,
      progress: state.progress,
      result: state.result,
      error: state.error,
      openFittingRoom,
      closeFittingRoom,
      resetFittingRoom,
      selectGarment,
      setUserImage,
      runTryOn,
    }),
    [state, selectedGarment, openFittingRoom, closeFittingRoom, resetFittingRoom, selectGarment, setUserImage, runTryOn]
  )

  return <FittingRoomContext.Provider value={value}>{children}</FittingRoomContext.Provider>
}

export function useFittingRoom() {
  const ctx = useContext(FittingRoomContext)
  if (!ctx) throw new Error("useFittingRoom must be used within FittingRoomProvider")
  return ctx
}
