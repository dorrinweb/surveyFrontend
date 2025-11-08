import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHouseholdDetails } from "../services/householdService";
import "../styles/global.css";
import "../styles/HouseholdDetailsPage.css";
import { FaInfoCircle, FaRoute, FaCheck, FaTimes, FaGift } from "react-icons/fa";

const HouseholdDetailsPage = () => {
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getHouseholdDetails = async () => {
      try {
        const response = await fetchHouseholdDetails();
        const data = response.data.household;

        if (!data || !data.individuals || data.individuals.length === 0) {
          navigate("/household/register", { replace: true });
          return;
        }

        setHousehold(data);
      } catch (err) {
        console.error("خطا در دریافت اطلاعات خانوار:", err);
        setError("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    getHouseholdDetails();
  }, [navigate]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleViewTrips = (individualId) => {
    navigate(`/trips/${individualId}`);
  };

  const checkIndividualStatus = (individual) => {
    if (individual.noTrip === true || individual.noInCity === true || individual.hasTrip === true) {
      return "completed";
    }
    return "pending";
  };

  const getHouseholdStatus = () => {
    if (!household || !household.individuals) return "pending";

    const allCompleted = household.individuals.every(
      (individual) => checkIndividualStatus(individual) === "completed"
    );

    return allCompleted ? "completed" : "pending";
  };

  const householdStatus = getHouseholdStatus();

  if (loading) {
    return <p>در حال بارگذاری اطلاعات خانوار...</p>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/review")}>بازگشت به صفحه قبل</button>
      </div>
    );
  }

  return (
    <div className="household-details">
      <h2>مشخصات خانوار</h2>

      {/* بنر قرعه‌کشی */}
      {householdStatus === "completed" ? (
        <div className="lottery-banner completed">
          <div className="banner-icon">
            <FaGift />
          </div>
          <div className="banner-content">
            <h3>🎉 تبریک! شماره تلفن شما جهت شرکت در قرعه‌کشی ثبت شد</h3>
            <p>
              وضعیت سفرهای تمامی اعضای خانوار شما تکمیل شده است. شما در
              قرعه‌کشی شرکت داده شده‌اید!
            </p>
          </div>
        </div>
      ) : (
        <div className="lottery-banner pending">
          <div className="banner-icon">
            <FaGift />
          </div>
          <div className="banner-content">
            <h3>📝 لطفاً وضعیت سفرهای تمامی اعضای خانوار را تکمیل کنید</h3>
            <p>
              برای شرکت در قرعه‌کشی، وضعیت سفرهای تمام اعضای خانوار را مشخص
              کنید.
            </p>
          </div>
        </div>
      )}

      {/* اطلاعات خانوار */}
      <div className="household-info">
        <h3>اطلاعات کلی خانوار</h3>
        <div className="info-box">
          <p>
            <strong>آدرس:</strong> {household.householdData.address}
          </p>
          <p>
            <strong>کدپستی:</strong> {household.householdData.postCode}
          </p>
          <p>
            <strong>تعداد اعضا:</strong> {household.householdData.householdCount}
          </p>
          <p>
            <strong>تعداد ماشین‌ها:</strong> {household.householdData.carCount}
          </p>
          <p>
            <strong>تعداد پارکینگ‌ها:</strong>{" "}
            {household.householdData.parkingSpacesCount}
          </p>
        </div>
      </div>

      {/* اعضای خانوار */}
      <div className="individuals-info">
        <h3>اعضای خانوار</h3>
        {household.individuals.map((individual, index) => {
          const individualStatus = checkIndividualStatus(individual);
          const routeColor =
            individualStatus === "completed" ? "green" : "red";

          return (
            <div key={individual.id} className="individual-item">
              <div className="accordion-header">
                <div className="member-info">
                  <span>عضو {index + 1}</span>
                </div>

                <div className="buttons-row">
                  {/* دکمه مشخصات */}
                  <button
                    className="action-button"
                    onClick={() => toggleAccordion(index)}
                    title="مشاهده مشخصات"
                  >
                    <FaInfoCircle size={20} />
                  </button>

                  {/* دکمه سفرها با رنگ و متن وضعیت */}
                  <div className="trip-button-wrapper">
                    <button
                      className="action-button"
                      onClick={() => handleViewTrips(individual.id)}
                      title="مشاهده سفرها"
                    >
                      <FaRoute
                        size={20}
                        style={{ color: routeColor, transition: "color 0.3s" }}
                      />
                    </button>
                    
                  </div>
                  <span
                      className="trip-status-label"
                      style={{
                        color: routeColor,
                        fontSize: "0.8rem",
                        marginTop: "4px",
                        display: "block",
                        textAlign: "center",
                        opacity: 1,
                      }}
                    >
                      {individualStatus === "completed"
                        ? "تکمیل‌شده"
                        : "در انتظار"}
                    </span>
                </div>
              </div>

              {openIndex === index && (
                <div className="accordion-body">
                  <p>
                    <strong>جنسیت:</strong> {individual.gender}
                  </p>
                  <p>
                    <strong>نسبت با خانوار:</strong>{" "}
                    {individual.relationWithHouseHold}
                  </p>
                  <p>
                    <strong>تحصیلات:</strong> {individual.education}
                  </p>
                  <p>
                    <strong>شغل:</strong> {individual.job}
                  </p>
                  <p>
                    <strong>درآمد ماهانه:</strong> {individual.income}
                  </p>
                  <p>
                    <strong>هزینه ماهانه:</strong> {individual.expenses}
                  </p>
                  <p>
                    <strong>گواهینامه رانندگی:</strong>{" "}
                    {individual.hasDrivingLicense ? "دارد" : "ندارد"}
                  </p>
                  <p>
                    <strong>مالکیت ماشین شخصی:</strong>{" "}
                    {individual.hasCarOwnership ? "دارد" : "ندارد"}
                  </p>

                  {individual.hasCarOwnership &&
                    individual.carDetails &&
                    individual.carDetails.length > 0 && (
                      <div>
                        <h6>اطلاعات خودرو:</h6>
                        {individual.carDetails.map((car, carIndex) => (
                          <div key={carIndex} className="car-info">
                            <p>
                              <strong>نوع خودرو:</strong> {car.carType}
                            </p>
                            <p>
                              <strong>نام خودرو:</strong> {car.carName}
                            </p>
                            <p>
                              <strong>سال تولید:</strong> {car.carYear}
                            </p>
                            <p>
                              <strong>نوع سوخت:</strong> {car.fuelType}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HouseholdDetailsPage;
