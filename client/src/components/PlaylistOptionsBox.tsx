import { useEffect, useRef } from "react";
import type { Playlist } from "@/types/PlaylistType";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useSuccessStore } from "@/states/SuccessState";
import { Spinner } from "./ui/spinner";
import { usePlaylistStore } from "@/states/PlaylistState";

interface PlaylistOptionsBoxProps {
  playlist: Playlist;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function PlaylistOptionsBox({
  playlist,
  anchorEl,
  onClose,
  onEdit,
}: PlaylistOptionsBoxProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setSuccessMessage } = useSuccessStore();
  const { removePlaylist } = usePlaylistStore();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete(
        `/api/playlist/delete/${playlist._id}`,
      );
      return res.data;
    },
    onSuccess: (data) => {
      onClose();
      navigate("/");
      removePlaylist(playlist._id);
      setSuccessMessage(data.message);
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  useEffect(() => {
    if (anchorEl) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          anchorEl &&
          !anchorEl.contains(event.target as Node)
        ) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-2xl py-1 z-50 border border-white/10 bg-surface-container-highest"
    >
      <button
        className="px-4 py-2 text-sm text-on-surface cursor-pointer hover:bg-on-surface/10 flex items-center gap-1 w-full"
        onClick={() => {
          onClose();
          onEdit();
        }}
      >
        <Pencil className="size-3.5" />
        Edit
      </button>
      <button
        disabled={deleteMutation.isPending}
        className="px-4 py-2 text-sm text-red-800 cursor-pointer hover:bg-on-surface/10 flex items-center gap-1 w-full"
        onClick={() => {
          deleteMutation.mutate();
        }}
      >
        <Trash2 className="size-3.5" />
        Delete
        {deleteMutation.isPending && <Spinner />}
      </button>
    </div>
  );
}
