import React from "react";
import FormLoader from "./FormLoader";
import RegistationForm from "./RegistationForm";

const Registation = () => {
  return (
    <div className="md:w-[600px] mx-auto bg-white rounded-md">
      <FormLoader label="Registation">
        <div className="min-h-[500px] h-[500px] max-h-[600px] overflow-y-auto">
          <RegistationForm />
        </div>
      </FormLoader>
    </div>
  );
};

export default Registation;
