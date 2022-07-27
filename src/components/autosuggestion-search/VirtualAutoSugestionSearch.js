import React, {
  useEffect,
  Fragment,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Combobox } from "@headlessui/react";
import axios from "axios";
import "./index.css";
import VirualListOfMultiSelect from "./VirtualList";

const lower = (str) =>
  typeof str === "string" ? str.toLowerCase().replace(/\s+/g, "") : "";
const isStr = (str) => typeof str === "string";
const separateStringByComma = (str, trueBlock, falseBlock) => {
  if (str.includes(",")) {
    str.split(",").forEach((item) => {
      trueBlock(item.trim());
    });
  } else {
    falseBlock(str.trim());
  }
};
const useChangeDropdownPosition = (inputContainerRef, dropdownHeight = 200) => {
  const [isReverse, setIsReverse] = useState(false);
  useEffect(() => {
    const scrollHandler = () => {
      const distanceFromInputToBottom =
        window.innerHeight -
        inputContainerRef.current.getBoundingClientRect().bottom;
      if (distanceFromInputToBottom < dropdownHeight) {
        setIsReverse(true);
      } else {
        setIsReverse(false);
      }
    };
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);
  return { isReverse };
};

export const VirtualAutoSuggestionSearch = ({
  virtualized,
  isSingleSelect,
  getLabel,
  getValue,
  transformResponse,
  apiCallInfo,
  inputPlaceholder,
  creatable,
  options,
  components,
  onHandle,
  getData,
  ...rest
}) => {
  const { value } = rest;
  useEffect(() => {
    if (value?.length) setSelectedItems(value);
  }, [value]);

  const addListItemRef = useRef();
  const [data, setData] = useState(options || []);
  const [isLoading, setIsLoading] = useState(false);
  const timeout = useRef();
  const inputContainerRef = useRef();
  const { isReverse } = useChangeDropdownPosition(inputContainerRef);
  const dropdownOpenButtonRef = useRef();

  const valueHandler = (e) => {
    clearTimeout(timeout.current);
    const typedValue = e.target.value;
    setQuery(typedValue);
    if (typedValue.length >= 2 && getData) {
      setIsLoading(true);
      timeout.current = setTimeout(() => {
        let searchedData = getData(typedValue);
        console.log(searchedData);
        setData(searchedData);
        setIsLoading(false);
      }, 1000);
    }
    if (apiCallInfo) {
      const { url, queryParams, dropdownItemsCount } = apiCallInfo;
      const fetch = async () => {
        try {
          const response = await axios.get(
            `${url}?${queryParams}=${typedValue}`
          );
          setIsLoading(false);
          const dataObj = transformResponse(response);
          setData(dataObj.slice(0, dropdownItemsCount));
        } catch (error) {
          setIsLoading(false);
          console.log({ error });
        }
      };
      if (typedValue.length >= 2) {
        setIsLoading(true);
        timeout.current = setTimeout(() => {
          fetch();
        }, 3000);
      }
    }
  };

  const [selectedItems, setSelectedItems] = useState([]);
  const [query, setQuery] = useState("");
  const transformedLabel = useCallback(
    (ele) => (isStr(ele) ? ele : getLabel(ele)),
    [getLabel]
  );

  const transformedValue = useCallback(
    (option) => {
      return isStr(option) ? option : getValue(option);
    },
    [getValue]
  );

  const filteredData = useMemo(
    () =>
      apiCallInfo || getData || query === ""
        ? data
        : data.filter((option) =>
            lower(transformedLabel(option)).includes(lower(query))
          ),
    /* eslint-disable  react-hooks/exhaustive-deps*/
    [query, data, apiCallInfo, transformedLabel]
  );

  const isSelected = useCallback(
    (currentItem) => {
      return selectedItems.some(
        (item) => transformedValue(item) === transformedValue(currentItem)
      );
    },
    [selectedItems, transformedValue]
  );

  const onSelection = (items) => {
    // console.log("onselection");
    // console.log({ items });
    const isItemsArray = Array.isArray(items);
    // console.log({ isItemsArray });
    if (isItemsArray) {
      const itemsArray = items.map((item) => transformedValue(item));
      //separating comma separated items into individual items
      const separatedItemsArray = [];

      const trueBlockFn = (value) => {
        value.length && separatedItemsArray.push(value.replace(/\.$/, ""));
      };
      const falseBlockFn = (el) => separatedItemsArray.push(el);

      itemsArray.forEach((el) => {
        separateStringByComma(el, trueBlockFn, falseBlockFn);
      });
      //removing duplicates
      const uniqueItemsArray = [...new Set(separatedItemsArray)];

      //remove items if case matches
      const caseSensitiveArray = uniqueItemsArray.filter(
        (el, idx, array) =>
          !array.some(
            (item, index) =>
              item.toLowerCase() === el.toLowerCase() && idx > index
          )
      );
      setSelectedItems(caseSensitiveArray);
    } else {
      setSelectedItems(transformedValue(items));
    }
  };

  const removeItem = (item) => {
    setSelectedItems((prev) => {
      const index = prev.indexOf(item);
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
  };

  const captureOnKeyDown = (e, activeOption) => {
    if (
      e.key === "Enter" &&
      filteredData.length !== 0 &&
      isSelected(activeOption)
    ) {
      setSelectedItems(
        selectedItems.filter(
          (item) => transformedValue(activeOption) !== transformedValue(item)
        )
      );
      e.stopPropagation();
    }
  };

  const handleCreateNewOption = () => {
    setQuery("");
    setSelectedItems((prev) => {
      let arr = [...prev];
      query.replace(/\s+|\?|\$/, "");
      const trueBlockFn = (value) => {
        if (!arr.includes(value) && value.length) arr.push(creatable(value));
      };
      const falseBlockFn = (str) => {
        if (!arr.includes(query)) arr.push(creatable(query));
      };
      separateStringByComma(query, trueBlockFn, falseBlockFn);
      return arr;
    });
  };
  const hasInputControl = useMemo(
    () => (components?.hasOwnProperty("InputControl") ? true : false),
    [components]
  );
  const additionalProps = {};
  if (!hasInputControl) {
    additionalProps.className =
      "w-full rounded py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0";
  }
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (isMountedRef.current) {
      onHandle(selectedItems);
    } else {
      isMountedRef.current = true;
    }
  }, [selectedItems]);

  const addNewItemHandler = (e) => {
    if (filteredData.length === 0 && query.length >= 2 && e.key === "Enter") {
      //eslint-disable no-unused-expressions
      addListItemRef.current?.click();
    }
  };
  return (
    <div className="combo-wrapper">
      <div className="w-full">
        <Combobox
          value={selectedItems}
          onChange={onSelection}
          multiple={isSingleSelect ? false : true}
        >
          {({ open, activeIndex, activeOption }) => {
            return (
              <>
                <div className="relative mt-1 pb-2 d-flex justify-content-start">
                  <div
                    ref={inputContainerRef}
                    className="relative w-100 cursor-default overflow-hidden rounded bg-white text-left border focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
                  >
                    <Combobox.Input
                      as={Fragment}
                      {...rest}
                      autoComplete="off"
                      {...additionalProps}
                      onChange={valueHandler}
                      onKeyDownCapture={(e) =>
                        captureOnKeyDown(e, activeOption)
                      }
                      onKeyDown={addNewItemHandler}
                      onClick={() => {
                        if (!open) dropdownOpenButtonRef.current.click();
                      }}
                      placeholder={inputPlaceholder}
                    >
                      {hasInputControl ? (
                        <components.InputControl />
                      ) : (
                        <input />
                      )}
                    </Combobox.Input>
                    {isLoading && (
                      <div className="flashing-anim">
                        <div className="dot-flashing"></div>
                      </div>
                    )}

                    <Combobox.Button
                      ref={dropdownOpenButtonRef}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 bg-transparent"
                    >
                      {!isLoading &&
                      filteredData.length === 0 &&
                      query.length >= 2 ? (
                        <span
                          style={{ fontSize: "25px" }}
                          onClick={() => {
                            addListItemRef.current.click();
                            setQuery("");
                          }}
                        >
                          &#43;
                        </span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className="h-5 w-5 text-gray-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      )}
                    </Combobox.Button>
                  </div>
                  <Combobox.Options
                    style={{ height: "280px" }}
                    className={`absolute ${
                      isReverse ? "reverse-position" : ""
                    } px-0 radius:8 flex  flex-column mt-5 max-h-60 w-100   overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
                  >
                    {isLoading && (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        <span>Loading...</span>
                      </div>
                    )}
                    {!isLoading &&
                      filteredData.length === 0 &&
                      query.length >= 2 && (
                        <div
                          className="relative cursor-default select-none py-2 px-4 text-gray-700"
                          ref={addListItemRef}
                          onClick={handleCreateNewOption}
                        >
                          Add {query}
                        </div>
                      )}
                    {!isLoading &&
                      (virtualized ? (
                        <VirualListOfMultiSelect
                          items={filteredData}
                          getValue={getValue}
                          isSelected={isSelected}
                        />
                      ) : (
                        filteredData?.map((item, idx) => {
                          return (
                            <Combobox.Option
                              key={idx}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-5 pr-4 ${
                                  active
                                    ? "bg-primary text-white"
                                    : "text-gray-900"
                                }`
                              }
                              value={getValue(item)}
                            >
                              {getValue(item)}
                            </Combobox.Option>
                          );
                        })
                      ))}
                  </Combobox.Options>
                </div>
                {!!selectedItems.length && !isSingleSelect && (
                  <ul className="flex flex-wrap ml-0 pl-0">
                    {selectedItems.map((el, idx) => (
                      <Fragment key={idx}>
                        <li className="chip  mr-1 mb-1">
                          {transformedLabel(el)}

                          <span
                            className="ml-1 hover:light"
                            onClick={() => removeItem(el)}
                          >
                            &times;
                          </span>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                )}
              </>
            );
          }}
        </Combobox>
      </div>
    </div>
  );
};
