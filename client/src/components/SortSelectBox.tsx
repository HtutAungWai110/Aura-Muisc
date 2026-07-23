import { SortMode, useSortStore } from "@/states/SortState"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SortSelectBox() {
  const { sortBy, setSortMode } = useSortStore()

  return (
    <Select value={sortBy} onValueChange={(value) => setSortMode(value as SortMode)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(SortMode).map((mode) => (
          <SelectItem key={mode} value={mode} className="bg-surface">
            {mode}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
