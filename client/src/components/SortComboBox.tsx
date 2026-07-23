import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { SortMode } from "@/states/SortState"
import { useSortStore } from "@/states/SortState"

export default function SortComboBox() {
  const modes = [
    SortMode.DateAscending,
    SortMode.DateDescending,
  ]
  const { sortBy, setSortMode } = useSortStore()
  const lee = "lee"
  console.log(SortMode.DateAscending, typeof (SortMode.DateAscending))

  return (
    <Combobox items={modes}>

      <ComboboxInput readOnly value={sortBy.toString()} />
      <ComboboxContent>
        <ComboboxEmpty>Sort by: {sortBy}</ComboboxEmpty>
            <ComboboxList className="bg-surface">
              {(item) => (
                <ComboboxItem  key={item} value={item} onClick={() => setSortMode(item)}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
  )
}
