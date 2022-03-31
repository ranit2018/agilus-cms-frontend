import React, { useEffect, useState } from "react";
import { Collapse, Row, Col } from "react-bootstrap";

function Scheduler({
  scheduler,
  value,
  onSchedulerDataChange = undefined,
  error = undefined,
}) {
  const date = new Date();
  // # state
  const [schedulerChecked, setSchedulerChecked] = useState(scheduler);
  const [schedulerData, setSchedulerData] = useState(value);

  useEffect(() => {
    setSchedulerData(value);
  }, [scheduler]);

  useEffect(() => {
    onSchedulerDataChange({ ...schedulerData, isSchedule: schedulerChecked });
  }, [schedulerData, schedulerChecked]);

  useEffect(() => {
    if (schedulerData.all_day_check) {
      setSchedulerData((prevData) => ({
        ...prevData,
        start_time: "",
        end_time: "",
      }));
    }
  }, [schedulerData.all_day_check]);

  // # handlers
  function handleSchedulerCheck() {
    setSchedulerChecked((prevData) => !prevData);
  }

  function handleFieldChange(ev) {
    const { name, value } = ev.target;
    if (name === "start_time") {
      setSchedulerData((prevData) => ({
        ...prevData,
        [name]: value,
        end_time: "",
      }));
    } else if (name === "start_date") {
      setSchedulerData((prevData) => ({
        ...prevData,
        [name]: value,
        end_date: "",
      }));
    } else {
      setSchedulerData((prevData) => ({ ...prevData, [name]: value }));
    }
  }

  return (
    <div>
      <div className="form-check">
        <input
          id="scheduler_check"
          checked={schedulerChecked}
          type="checkbox"
          value="off"
          onChange={handleSchedulerCheck}
        />
        <label htmlFor="scheduler_check">Set scheduler</label>
      </div>
      <Collapse in={schedulerChecked}>
        <Row>
          <Col xs={12} sm={12} md={6}>
            <label htmlFor="start_date">Start date*:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              min={date.toISOString().split("T")[0]}
              value={schedulerData.start_date}
              onChange={handleFieldChange}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <label htmlFor="end_date">End date*:</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              min={schedulerData.start_date}
              value={schedulerData.end_date}
              onChange={handleFieldChange}
            />
          </Col>
          <Col
            xs={12}
            sm={12}
            md={6}
            style={{ display: schedulerData.all_day_check ? "none" : "block" }}
          >
            <label htmlFor="start_time">Start time*:</label>
            <input
              id="start_time"
              type="time"
              name="start_time"
              value={schedulerData.start_time}
              onChange={handleFieldChange}
            />
          </Col>
          <Col
            xs={12}
            sm={12}
            md={6}
            style={{ display: schedulerData.all_day_check ? "none" : "block" }}
          >
            <label htmlFor="end_time">End time*:</label>
            <input
              id="end_time"
              type="time"
              name="end_time"
              min={schedulerData.start_time}
              value={schedulerData.end_time}
              onChange={handleFieldChange}
            />
          </Col>
          <Col xs={12} sm={12} md={12}>
            <input
              id="all_day_check"
              checked={schedulerData.all_day_check}
              type="checkbox"
              value="off"
              onChange={() => {
                setSchedulerData((prevData) => ({
                  ...prevData,
                  all_day_check: !prevData.all_day_check,
                }));
              }}
            />
            <label htmlFor="all_day_check">All day</label>
          </Col>
          <Col xs={12} sm={12} md={12}>
            <label htmlFor="repeat_scheduler">Repeat:</label>
            <select
              id="repeat_scheduler"
              name="repeat"
              value={schedulerData.repeat}
              onChange={handleFieldChange}
            >
              <option value="no_repeat">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </Col>
          {error && (
            <Col xs={12} sm={12} md={12}>
              <p style={{ color: "red" }}>Please fill the required field</p>
            </Col>
          )}
        </Row>
      </Collapse>
    </div>
  );
}

export { Scheduler };
