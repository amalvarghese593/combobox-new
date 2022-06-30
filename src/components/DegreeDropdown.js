import React, { useState, useEffect } from "react";
import { AutoSuggestionSearch } from "./AutoSuggestionSearch";
import { EDUCATION } from "./data";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

export const DegreeDropdown = () => {
  const [data, setData] = useState();
  const apiCallOptions = {
    url: "https://jsonplaceholder.typicode.com/users",
    queryParams: "search",
    dropdownItemsCount: 15,
  };
  const initialValues = {
    email: "",
    password: "",
    degree: data || [],
    // degree: ["mca", "bca", "mba"],
  };
  const validationSchema = Yup.object({
    email: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
    degree: Yup.array().of(Yup.string()),
  });
  const onSubmit = () => {
    alert("submitted");
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    // validateOnMount: true,
    onSubmit,
  });
  const onHandle = (data) => {
    console.log({ data });
    formik.setFieldValue("degree", data);
  };
  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      // console.log({ res });
      const arr = res.data.map((el) => el.name);
      setData(arr);
      // console.log({ arr });
    };
    fetch();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-center p-3">
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
              <AutoSuggestionSearch
                apiCallInfo={apiCallOptions}
                // onChange={(e) => {
                //   console.log(e);
                // }}
                // options={EDUCATION}
                //   options={["bca", "mca", "bsc"]}
                inputPlaceholder="Select Degree"
                transformResponse={(res) => {
                  return res.data /* ?.map((d) => d.location) || [] */;
                }}
                components={
                  {
                    // InputControl: InputSearch,
                  }
                }
                getValue={(o) => o.name}
                getLabel={(o) => o.name}
                creatable={(newSkill) => newSkill}
                name="degree"
                value={formik.values.degree}
                // setFieldValue={formik.setFieldValue}
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
