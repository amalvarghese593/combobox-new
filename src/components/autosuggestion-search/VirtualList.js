import React, { useRef } from "react";
import { Combobox } from "@headlessui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "@heroicons/react/solid";

const VirualListOfMultiSelect = ({ items, getValue, isSelected }) => {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  return (
    <div
      ref={parentRef}
      className="List"
      style={{
        height: `200px`,
        width: `400px`,
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <Combobox.Option
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className={({ active }) =>
              `relative cursor-default select-none py-2 pl-2 pr-4 ${
                active ? "bg-dark-grey text-gray-900" : "text-gray-900"
                // active ? "bg-dark-grey text-white" : "text-gray-900"
              }`
            }
            value={items?.[virtualRow.index]}
          >
            {({ selected, active }) => (
              <>
                <span
                  className={`block truncate ${
                    selected || isSelected(getValue(items?.[virtualRow.index]))
                      ? "font-medium selected-item"
                      : "font-normal"
                  }`}
                >
                  {getValue(items?.[virtualRow.index])}
                </span>
                {isSelected(getValue(items?.[virtualRow.index])) || selected ? (
                  <span
                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                      active ? "text-teal-600" : "text-teal-600"
                      // active ? "text-white" : "text-teal-600"
                    }`}
                  >
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )}
          </Combobox.Option>
        ))}
      </div>
    </div>
  );
};
export default VirualListOfMultiSelect;
