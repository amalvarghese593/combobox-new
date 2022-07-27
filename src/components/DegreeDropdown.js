import React, { useState, useEffect } from "react";
// import { AutoSuggestionSearch } from "./AutoSuggestionSearch";
import { AutoSuggestionSearch } from "./autosuggestion-search/AutoSuggestionSearch";
import { EDUCATION } from "./data";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { VirtualAutoSuggestionSearch } from "./autosuggestion-search/VirtualAutoSugestionSearch";

// const useGetSkills = () => {
//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const res = await axios.get(
//           "https://nextmov.webpipl.com/api/v1/skills/"
//         );
//         return res.data.result;
//       } catch (error) {
//         console.log(error);
//         return [];
//       }
//     };
//     fetch();
//   }, []);
// };

export const DegreeDropdown = () => {
  const numArr = Array.from({ length: 5000 }, (el, idx) => ({
    item: `item${idx}`,
  }));
  const [num, setNum] = useState([]);
  useEffect(() => {
    const arr = Array.from({ length: 5000 }, (el, idx) => ({
      item: `item${idx}`,
    }));
    setNum(arr);
  }, []);

  const [data, setData] = useState();
  // const apiCallOptions = {
  //   url: "https://nextmov.webpipl.com/api/v1/skills/",
  //   dropdownItemsCount: 15,
  // };
  // const apiCallOptions = {
  //   url: "https://jsonplaceholder.typicode.com/users",
  //   queryParams: "search",
  //   dropdownItemsCount: 15,
  // };
  const apiCallOptions = {
    url: "https://firstleap-api.firstconnectsolutions.com/api/v1/users/getskills",
    queryParams: "search",
    dropdownItemsCount: 15,
  };
  const initialValues = {
    email: "",
    password: "",
    degree: [],
    // degree: data || [],
  };
  const validationSchema = Yup.object({
    email: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
    degree: Yup.array().of(Yup.string()),
  });
  const onSubmit = (values) => {
    alert("submitted");
    console.log({ values });
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit,
  });
  const onHandle = (data) => formik.setFieldValue("degree", data);
  // useEffect(() => {
  //   const fetch = async () => {
  //     const res = await axios.get("https://jsonplaceholder.typicode.com/users");
  //     const arr = res.data.map((el) => el.name);
  //     setData(arr);
  //   };
  //   fetch();
  // }, []);
  // const newSkills = useGetSkills();
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          "https://nextmov.webpipl.com/api/v1/skills/"
        );
        // console.log({ res });
        setSkills(res.data.result);
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);
  return (
    <div>
      <div
        className="d-flex justify-content-center p-3"
        style={{
          marginTop: "220px",
        }}
      >
        <form
          onSubmit={formik.handleSubmit}
          className="w-50 text-start border p-3"
        >
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className="form-control"
              id="exampleInputEmail1"
            />
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              className="form-control"
              id="exampleInputPassword1"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Degree
            </label>
            <div>
              <VirtualAutoSuggestionSearch
                apiCallInfo={apiCallOptions}
                // options={numArr}
                // options={skills}
                inputPlaceholder="Select skills"
                // transformResponse={(res) => {
                //   return res.result /* ?.map((d) => d.location) || [] */;
                // }}
                transformResponse={(res) => {
                  return res.data.data;
                }}
                components={
                  {
                    // InputControl: InputSearch,
                  }
                }
                isVirtualizationEnabled={false}
                getValue={(o) => o.skill_name}
                getLabel={(o) => o.skill_name}
                creatable={(newSkill) => newSkill}
                name="degree"
                value={formik.values.degree}
                onHandle={onHandle}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

const InputSearch = () => {
  return <input type="text" className="border border-success h-9" />;
};
