import React from "react";
import { Formik } from "formik";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { observer } from "mobx-react";
import * as yup from "yup";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import CurrentWeather from "./CurrentWeather";
import Forecast from "./Forecast";
import { geolocated } from "react-geolocated";
import { getLocationByLatLng } from "./request";
const schema = yup.object({
  keyword: yup.string().required("Keyword is required")
});
const buttonStyle = { marginRight: "10px" };
function HomePage({ keywordStore, coords }) {
  const [initialized, setInitialized] = React.useState(false);
  const handleSubmit = async evt => {
    const isValid = await schema.validate(evt);
    if (!isValid) {
      return;
    }
    localStorage.setItem("keyword", evt.keyword);
    keywordStore.setKeyword(evt.keyword);
  };
  const getWeatherCurrentLocation = async () => {
    const { latitude, longitude } = coords;
    const { data } = await getLocationByLatLng(latitude, longitude);
    const keyword = (
      data.results[0].address_components.find(c =>
        c.types.includes("locality")
      ) || {}
    ).long_name;
    localStorage.setItem("keyword", keyword);
    keywordStore.setKeyword(keyword);
  };
  const clear = () => {
    localStorage.clear();
    keywordStore.setKeyword("");
  };
  React.useEffect(() => {
    if (!initialized) {
      keywordStore.setKeyword(localStorage.getItem("keyword") || "");
      setInitialized(true);
    }
  }, [keywordStore.keyword]);
  return (
    <div className="page">
      <h1>Weather</h1>
      <Formik
        validationSchema={schema}
        onSubmit={handleSubmit}
        initialValues={{ keyword: localStorage.getItem("keyword") || "" }}
        enableReinitialize={true}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          touched,
          isInvalid,
          errors
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} md="12" controlId="keyword">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="keyword"
                  placeholder="City"
                  value={values.keyword || ""}
                  onChange={handleChange}
                  isInvalid={touched.keyword && errors.keyword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.keyword}
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <Button type="submit" style={buttonStyle}>
              Search
            </Button>
            <Button
              type="button"
              onClick={getWeatherCurrentLocation}
              style={buttonStyle}
              disabled={!coords}
            >
              Get Weather of Current Location
            </Button>
            <Button type="button" onClick={clear}>
              Clear
            </Button>
          </Form>
        )}
      </Formik>
      <br />
      <Tabs defaultActiveKey="weather">
        <Tab eventKey="weather" title="Current Weather">
          <CurrentWeather keywordStore={keywordStore} />
        </Tab>
        <Tab eventKey="forecast" title="Forecast">
          <Forecast keywordStore={keywordStore} />
        </Tab>
      </Tabs>
    </div>
  );
}
HomePage = observer(HomePage);
export default geolocated({
  positionOptions: {
    enableHighAccuracy: false
  },
  userDecisionTimeout: 5000
})(HomePage);