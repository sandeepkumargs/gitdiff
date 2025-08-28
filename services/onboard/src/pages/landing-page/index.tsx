import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { Button } from "primereact/button";
import logo from "../../assets/logo.png";
import footerBg from "../../assets/landing-footer.jpg";
import spinnerbg from "../../assets/sidespinnerbg.png";
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
import { Card } from "primereact/card";
import spinnerfull from "../../assets/sidespinnerfull.png";
import "./index.css";
// import igs_logo from '../../assets/IGS_LOGO.png';
// import Disclaimer from '../../components/Disclaimer/index';
import NavBar from "../../components/NavBar";

interface ArrowProps {
  onClick: () => void;
}

const CustomPrevArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    className="slick-prev"
    onClick={onClick}
    style={{
      position: "absolute",
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      zIndex: 1,
      cursor: "pointer",
    }}
  >
    <Button
      icon="pi pi-chevron-up"
      className="p-button-rounded p-button-secondary"
    />
  </button>
);

const CustomNextArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    className="slick-next"
    onClick={onClick}
    style={{
      position: "absolute",
      bottom: "50%",
      left: "10px",
      transform: "translateY(50%)",
      background: "transparent",
      border: "none",
      zIndex: 1,
      cursor: "pointer",
    }}
  >
    <Button
      icon="pi pi-chevron-down"
      className="p-button-rounded p-button-secondary"
    />
  </button>
);

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const listItems = [
    { iconClass: "pi pi-cog", text: "Requirement Analysis" },
    { iconClass: "pi pi-calendar", text: "Test Planning" },
    { iconClass: "pi pi-pencil", text: "Test Case Development" },
    { iconClass: "pi pi-play", text: "Test Execution" },
    { iconClass: "pi pi-file", text: "Test Reports" },
    { iconClass: "pi pi-chart-line", text: "Test Monitoring" },
  ];

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const sectionStyle = {
    backgroundImage: `url(${spinnerbg})`,
    backgroundSize: "30% auto",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right",
    minHeight: "100vh",
    paddingTop: "0px",
  };

  const footerStyle = {
    backgroundImage: `url(${footerBg})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: "#00204a",
    minHeight: "50vh",
  };

  const itemTemplate = (item: any) => (
    <div className="text-center mb-8 flex-shrink-0 w-full px-4">
      <h2 className="text-3xl lg:text-5xl mt-48 lg:mt-24 text-black lg:text-white font-bold mb-4">
        {item.title}
      </h2>
      <p className="text-lg lg:text-2xl text-black lg:text-white mb-4">
        {item.description}
      </p>
      <Button
        severity="info"
        label="Try Now"
        // className="p-button p-button-rounded p-button-danger mt-4 transition-transform transform hover:scale-110"
        className="p-button-primary p-button-rounded p-button-sm mt-4 self-end"
        style={{ backgroundColor: "#283593", borderColor: "#283593" }}
        onClick={() => handleCardClick(item.path)}
      />
    </div>
  );

  const carouselItems = [
    {
      title: "Ambiguity Checker",
      description: "Identify ambiguities in requirements and refine them",
      path: "/sign-up",
    },
    {
      title: "Maps & Flows",
      description: "Visualize your requirements in multiple dimensions",
      path: "/sign-up",
    },
    {
      title: "Test Scenarios",
      description: "Identify test scenarios for your requirements",
      path: "/sign-up",
    },
  ];

  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          vertical: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <NavBar />

      <div
        style={{
          ...sectionStyle,
          backgroundImage:
            window.innerWidth < 768 ? "none" : `url(${spinnerbg})`,
        }}
        className="flex flex-col lg:flex-row items-center justify-between min-h-screen gap-10 px-8 mt-20"
      >
        <div className="flex justify-center items-center lg:items-start w-full lg:w-1/4">
          <Card className="p-8 md:p-12 lg:p-16 rounded-xl shadow-lg bg-white w-full">
            {/* <h2 className="text-blue-900 text-2xl font-bold mb-6">Qualizen</h2> */}
            <ul className="space-y-4">
              {listItems.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-center text-gray-700 cursor-pointer ${
                    activeIndex === index ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleClick(index)}
                >
                  <i className={`${item.iconClass} text-xl mr-3`}></i>
                  {item.text}
                  {activeIndex === index && (
                    <i className="pi pi-angle-right ml-auto"></i>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col items-center text-center w-full lg:w-1/3">
          <div className="flex items-center justify-center lg:flex hidden">
            {/* <img src={igs_logo} className="h-24 w-24 lg:h-[150px] lg:w-[150px] mb-4" /> */}
          </div>
          <div className="flex items-center justify-center lg:hidden">
            {/* <img src={igs_logo} className="h-16 w-16 mb-4" /> */}
          </div>
          {/* <h1 className="text-4xl lg:text-6xl font-bold text-blue-900">Qualizen</h1> */}
          <div className="mb-4"></div>
          <h2 className="text-xl lg:text-2xl text-gray-500">
            End To End AI Accelerated QA
          </h2>
          <p className="mt-4 text-xl lg:text-4xl font-semibold text-orange-500">
            Leveraging the power of Artificial Intelligence
          </p>
        </div>

        <div className="flex justify-center items-center w-full lg:w-1/3">
          <div className="carousel-container w-full">
            <Slider {...carouselSettings}>
              {carouselItems.map(itemTemplate)}
            </Slider>
          </div>
        </div>
      </div>

      <div className="lg:p-16 bg-white">
        <div className="p-8 md:p-16 bg-white">
          <div className="flex flex-col md:flex-row rounded-[25px] shadow-lg w-full max-w-8xl overflow-hidden mb-10">
            <div className="flex-1 bg-blue-900 p-8 flex items-center justify-center">
              <h2 className="text-white text-2xl md:text-3xl font-bold">
                Ambiguity Checker
              </h2>
            </div>
            <div className="flex-1 bg-[#F8F9FAFF] p-8 flex flex-col justify-between">
              <p className="text-gray-700 text-md md:text-lg">
                Analyzes the context of requirements by assisting detect vague,
                unclear, or ambiguous requirements and helps refine the
                requirements with criteria for success and assumptions.
              </p>
              <Button
                label="Try Now"
                className="p-button-primary p-button-rounded p-button-sm mt-4 self-end"
                style={{ backgroundColor: "#283593", borderColor: "#283593" }}
                onClick={() => handleCardClick("/sign-up")}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row rounded-[25px] shadow-lg w-full max-w-8xl overflow-hidden mb-10">
            <div className="flex-1 bg-[#F8F9FAFF] p-8 flex flex-col justify-between">
              <p className="text-gray-700 text-md md:text-lg">
                Significantly improve the clarity, coverage, and efficiency of
                their testing process, leading to higher quality software.
              </p>
              <Button
                label="Try Now"
                className="p-button-primary p-button-rounded p-button-sm mt-4 self-end"
                style={{ backgroundColor: "#283593", borderColor: "#283593" }}
                onClick={() => handleCardClick("/sign-up")}
              />
            </div>
            <div className="flex-1 bg-blue-900 p-8 flex items-center justify-center">
              <h2 className="text-white text-2xl md:text-3xl font-bold">
                Mind Maps
              </h2>
            </div>
          </div>
          <div className="flex flex-col md:flex-row rounded-[25px] shadow-lg w-full max-w-8xl overflow-hidden mb-10">
            <div className="flex-1 bg-blue-900 p-8 flex items-center justify-center">
              <h2 className="text-white text-2xl md:text-3xl font-bold">
                Test Scenarios
              </h2>
            </div>
            <div className="flex-1 bg-[#F8F9FAFF] p-8 flex flex-col justify-between">
              <p className="text-gray-700 text-md md:text-lg">
                AI-driven test scenario generation increases coverage, accuracy
                and efficiency. Identifying edge cases and high-risk areas
              </p>
              <Button
                label="Try Now"
                className="p-button-primary p-button-rounded p-button-sm mt-4 self-end"
                style={{ backgroundColor: "#283593", borderColor: "#283593" }}
                onClick={() => handleCardClick("/sign-up")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* <Disclaimer /> */}
    </div>
  );
};

export default Homepage;

//
