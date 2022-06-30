// import { Fragment, useState } from "react";
// import { Combobox } from "@headlessui/react";

// export const MyCombobox = () => {
//   const [people, setPeople] = useState([
//     { id: 1, name: "Durward Reynolds" },
//     { id: 2, name: "Kenton Towne" },
//     { id: 3, name: "Therese Wunsch" },
//     { id: 4, name: "Benedict Kessler" },
//     { id: 5, name: "Katelyn Rohan" },
//   ]);
//   const [selected, setselected] = useState([]);
//   const [query, setQuery] = useState("");

//   const filteredPeople =
//     query === ""
//       ? people
//       : people.filter((person) => {
//           return person.name.toLowerCase().includes(query.toLowerCase());
//         });

//   return (
//     <div className="combo-wrapper d-flex justify-content-center">
//       <div className="combo-container w-25">
//         <Combobox value={selected} onChange={setselected} multiple>
//           <div className="d-flex">
//             <Combobox.Input
//               className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
//               onChange={(event) => setQuery(event.target.value)}
//             />
//             <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="16"
//                 height="16"
//                 fill="currentColor"
//                 className="bi bi-caret-down"
//                 viewBox="0 0 16 16"
//               >
//                 <path d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z" />
//               </svg>
//             </Combobox.Button>
//           </div>
//           <Combobox.Options>
//             {query.length > 0 && filteredPeople.length === 0 && (
//               <Combobox.Option className="" value={{ id: null, name: query }}>
//                 Create {query}
//               </Combobox.Option>
//             )}
//             {filteredPeople.map((person) => (
//               <Combobox.Option
//                 className=""
//                 onClick={(e) => {
//                   setPeople((prev) => {
//                     // const value = e.target.value;
//                     const index = prev.indexOf(person);
//                     const arr = [...prev];
//                     arr.splice(index, 1);
//                     return arr;
//                   });
//                 }}
//                 value={person}
//               >
//                 {person.name}
//               </Combobox.Option>
//             ))}
//           </Combobox.Options>
//           {!!selected.length && (
//             <ul className="list-group combo-list-group">
//               {selected.map((person) => (
//                 <Fragment key={person.id}>
//                   <li>{person.name}</li>
//                   <span
//                     onClick={() => {
//                       setPeople((prev) => {
//                         const arr = [...prev];
//                         arr.push(person);
//                         return arr;
//                       });
//                       setselected((prev) => {
//                         const index = prev.indexOf(person);
//                         const arr = [...prev];
//                         arr.splice(index, 1);
//                         return arr;
//                       });
//                     }}
//                   >
//                     x
//                   </span>
//                 </Fragment>
//               ))}
//             </ul>
//           )}
//         </Combobox>
//       </div>
//     </div>
//   );
// };

import { Fragment, useState, useRef, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const MyCombobox = () => {
  const addListItemRef = useRef();
  const optionRef = useRef();
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const timeout = useRef();
  const valueHandler = (e) => {
    clearTimeout(timeout.current);

    const typedValue = e.target.value;
    setQuery(typedValue);
    // setFieldValue(name, typedValue);
    //to remove dropdown on backspacing entire content
    // if (locationValue.length === 1) setLocations([]);

    const fetch = async () => {
      try {
        // setIsLoading(true);
        const response = await axios.get(
          `https://firstleap-api.firstconnectsolutions.com/api/v1/users/getLocations?search=${typedValue}`
        );
        setIsLoading(false);
        const locationObj = response.data.data;
        setPeople(locationObj.slice(0, 15));
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
  };
  // useEffect(() => {
  //   const fetch = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         "https://firstleap-api.firstconnectsolutions.com/api/v1/users/getLocations"
  //         // "https://deelay.me/5000/https://firstleap-api.firstconnectsolutions.com/api/v1/users/getLocations"
  //       );
  //       setIsLoading(false);
  //       console.log({ response });
  //       setPeople(response.data.data);
  //     } catch (error) {
  //       setIsLoading(false);
  //       console.log(error);
  //     }
  //   };
  //   fetch();
  // }, []);

  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) =>
          person.location
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div className="combo-wrapper p-2">
      {/* <div className="fixed top-16 w-72 border border-danger"> */}
      <div className="w-full">
        <Combobox value={selected} onChange={setSelected} multiple>
          <div className="relative mt-1 pb-2">
            <div className="relative w-80 sm:w-96 mx-auto cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                // displayValue={(person) => person.name}
                onChange={valueHandler}
                onKeyDown={(e) => {
                  if (
                    filteredPeople.length === 0 &&
                    query.length >= 2 &&
                    e.key === "Enter"
                  ) {
                    addListItemRef.current?.click();
                    setQuery("");
                  }
                }}
                placeholder="Select location"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                {!isLoading &&
                filteredPeople.length === 0 &&
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
            {/* <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            > */}
            <Combobox.Options className="absolute mt-1 max-h-60 w-80 sm:w-96 left-1/2 -translate-x-1/2 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  <span>Loading...</span>
                </div>
              )}
              {!isLoading && filteredPeople.length === 0 && query.length >= 2 && (
                // <Combobox.Option
                //   className="relative cursor-default select-none py-2 px-4 text-gray-700"
                //   value={{ id: null, name: query }}
                // >
                <div
                  className="relative cursor-default select-none py-2 px-4 text-gray-700"
                  ref={addListItemRef}
                  onClick={() => {
                    setQuery("");
                    setSelected((prev) => {
                      let arr = [...prev];
                      if (query.includes(",")) {
                        const multipleValues = query.split(",");
                        multipleValues.forEach((value) => {
                          console.log({ value });
                          if (value.trim() !== "") {
                            arr.push({ _id: uuidv4(), location: value });
                          }
                        });
                      } else {
                        arr.push({ _id: uuidv4(), location: query });
                      }
                      return arr;
                    });
                  }}
                >
                  Add {query}
                </div>
                // </Combobox.Option>
              )}
              {!isLoading &&
                filteredPeople.map((person) => (
                  <Combobox.Option
                    ref={optionRef}
                    key={person._id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    // onClick={(e) => {
                    //   setPeople((prev) => {
                    //     const index = prev.indexOf(person);
                    //     const arr = [...prev];
                    //     arr.splice(index, 1);
                    //     return arr;
                    //   });
                    // }}
                    // onKeyDown={(e) => {
                    //   if (e.key === "Enter") {
                    //     optionRef.current.click();
                    //   }
                    // }}
                    value={person}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {person.location}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
            </Combobox.Options>
            {/* </Transition> */}
          </div>
          {!!selected.length && (
            <ul className="list-group combo-list-group">
              {selected.map((person) => (
                <Fragment key={person._id}>
                  <li>
                    {person.location}
                    <span
                      onClick={() => {
                        // setPeople((prev) => {
                        //   const arr = [...prev];
                        //   arr.push(person);
                        //   return arr;
                        // });
                        setSelected((prev) => {
                          const index = prev.indexOf(person);
                          const arr = [...prev];
                          arr.splice(index, 1);
                          return arr;
                        });
                      }}
                    >
                      x
                    </span>
                  </li>
                </Fragment>
              ))}
            </ul>
          )}
        </Combobox>
      </div>
    </div>
  );
};
export default MyCombobox;
