import React, {
  useEffect,
  Fragment,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import axios from "axios";

const lower = (str) =>
  typeof str === "string" ? str.toLowerCase().replace(/\s+/g, "") : "";
const isStr = (str) => typeof str === "string";
const useDidUpdateEffect = (fn, inputs) => {
  const firstTimeRef = useRef(true);
  useEffect(() => {
    if (firstTimeRef.current) {
      console.log("fdsfdsfd");
      firstTimeRef.current = false;
      return;
    }
    fn();
    /*eslint-disable react-hooks/exhaustive-deps */
  }, inputs);
};

export const AutoSuggestionSearch = ({
  getLabel,
  getValue,
  transformResponse,
  apiCallInfo,
  inputPlaceholder,
  creatable,
  options,
  // onChange,
  components,
  // setFieldValue,
  onHandle,
  ...rest
}) => {
  const { value } = rest;
  useEffect(() => {
    if (value.length) {
      setSelectedItems(value);
    }
  }, [value]);

  const addListItemRef = useRef();
  const optionRef = useRef();
  const [data, setData] = useState(options || []);
  const [isLoading, setIsLoading] = useState(false);
  const timeout = useRef();

  const valueHandler = (e) => {
    clearTimeout(timeout.current);
    const typedValue = e.target.value;
    // setFieldValue("degree", [typedValue]);
    setQuery(typedValue);
    if (apiCallInfo) {
      const {
        url,
        queryParams,

        dropdownItemsCount,
      } = apiCallInfo;
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

  // useDidUpdateEffect(() => {
  //   console.log("yes");
  //   onChange(selectedItems);
  // }, []);
  const filteredData = useMemo(
    () =>
      apiCallInfo || query === ""
        ? data
        : data.filter((option) =>
            lower(transformedLabel(option)).includes(lower(query))
          ),
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

  //handle logic of creation of new item
  const handleCreate = (e, el) => {
    let inputSelectedValue = lower(transformedValue(el));
    if (isSelected(el)) {
      e.stopPropagation();
      setSelectedItems((prev) =>
        prev.filter((i) => lower(transformedValue(i)) !== inputSelectedValue)
      );
    }
  };
  const onSelection = (items) => {
    console.log("onselection");
    // console.log("Items-selected:", items);
    // setFieldValue(
    //   "degree",
    //   items.map((item) => transformedValue(item))
    // );
    setSelectedItems(items.map((item) => transformedValue(item)));
  };

  const removeItem = (item) => {
    // console.log(selectedItems);
    // setSelectedItems((prev) => {
    //   const index = prev.indexOf(transformedValue(item));
    //   const arr = [...prev];
    //   return arr.splice(index, 1);
    // });
    setSelectedItems((prev) => {
      const index = prev.indexOf(item);
      const arr = [...prev];
      arr.splice(index, 1);
      // setFieldValue("degree", arr);
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
      if (query.includes(",")) {
        query.split(",").forEach((value) => {
          if (!arr.includes(value)) arr.push(creatable(value));
        });
      } else {
        if (!arr.includes(query)) arr.push(creatable(query));
      }
      return arr;
    });
    // stateduuuupdatedRef.current = true;
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

  return (
    <div className="combo-wrapper ">
      <div className="w-full">
        <Combobox value={selectedItems} onChange={onSelection} multiple>
          {({ activeIndex, activeOption }) => {
            return (
              <>
                <div className="relative mt-1 pb-2 d-flex justify-content-start">
                  <div className="relative w-80 sm:w-96  cursor-default overflow-hidden rounded bg-white text-left border focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    {/* <div className="relative w-80 sm:w-96  cursor-default overflow-hidden rounded bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"> */}
                    <Combobox.Input
                      as={Fragment}
                      {...rest}
                      autoComplete="off"
                      {...additionalProps}
                      // className="w-full rounded py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      // className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      onChange={valueHandler}
                      onKeyDownCapture={(e) =>
                        captureOnKeyDown(e, activeOption)
                      }
                      onKeyDown={(e) => {
                        if (
                          filteredData.length === 0 &&
                          query.length >= 2 &&
                          e.key === "Enter"
                        ) {
                          addListItemRef.current?.click();
                        }
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

                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      {!isLoading &&
                      filteredData.length === 0 &&
                      query.length >= 2 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          onClick={() => {
                            addListItemRef.current.click();
                            setQuery("");
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      ) : (
                        <SelectorIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      )}
                    </Combobox.Button>
                  </div>
                  <Combobox.Options className="absolute mt-10 max-h-60 w-80 sm:w-96  overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                      filteredData.map((el, idx) => (
                        <Combobox.Option
                          ref={optionRef}
                          key={idx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-teal-600 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={el}
                          onClickCapture={(e) => handleCreate(e, el)}
                        >
                          {({ selected, active }) => {
                            return (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected || isSelected(el)
                                      ? "font-medium"
                                      : "font-normal"
                                  }`}
                                >
                                  {transformedLabel(el)}
                                </span>
                                {isSelected(el) || selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? "text-white" : "text-teal-600"
                                    }`}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            );
                          }}
                        </Combobox.Option>
                      ))}
                  </Combobox.Options>
                </div>
                {!!selectedItems.length && (
                  <ul className="list-group combo-list-group">
                    {selectedItems.map((el, idx) => (
                      <Fragment key={idx}>
                        <li>
                          {transformedLabel(el)}
                          <span onClick={() => removeItem(el)}>x</span>
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
