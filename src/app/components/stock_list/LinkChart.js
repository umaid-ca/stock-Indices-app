"use client"
import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { dataByHour } from "@/app/assets/dummyData";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { timestampConverter } from '@/app/assets/utils';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  annotationPlugin
);

const data = {
    labels: dataByHour.map((entry) => timestampConverter(entry.timestamp)),
    datasets: [
      {
      label: 'Price',
      data: dataByHour.map((entry) => entry.value.toFixed(2)),
      borderColor: 'aqua',
      backgroundColor: 'aqua',
      tension: 0.4,
    },
  ]
  }

  const initialOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
      annotation: {
        annotations: {},
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  

const LineChart = () => {
    const { data: session, status } = useSession()
    const chartRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedLine, setDraggedLine] = useState(null);
    const [clickCount, setClickCount] = useState(0);
    const [supportLineValue, setsupportLineValue] = useState(null)
    const [resistanceLineValue, setResistanceLineValue] = useState(null)
    const router = useRouter();
    const getRelativePosition = (event, chart) => {
      const rect = chart.canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };
  
    const handleMouseDown = (event) => {
        if (!chartRef.current) return;
    
        const chart = chartRef.current;
        const annotations = chart.options.plugins.annotation.annotations;
        const position = getRelativePosition(event, chart);
        const yValue = chart.scales['y'].getValueForPixel(position.y);
    
        const line = getLineAtEvent(event, chart);
        if (line) {
          setIsDragging(true);
          setDraggedLine(line);
        } else {
          setClickCount((prevCount) => {
            if (prevCount === 0) {
                setsupportLineValue(yValue.toFixed(2))
              annotations.supportLine = {
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y',
                value: yValue,
                borderColor: 'green',
                borderWidth: 2,
                label: {
                  content: 'Support',
                  enabled: true,
                  position: 'start',
                },
              };
              chart.update();
              return 1;
            } else if (prevCount === 1) {
                setResistanceLineValue(yValue.toFixed(2))
              annotations.resistanceLine = {
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y',
                value: yValue,
                borderColor: 'red',
                borderWidth: 2,
                label: {
                  content: 'Resistance',
                  enabled: true,
                  position: 'start',
                },
              };
              chart.update();
              return 0;
            }
          });
        }
      };
  
    const getLineAtEvent = (event, chart) => {
      const position = getRelativePosition(event, chart);
      const yValue = chart.scales['y'].getValueForPixel(position.y);
      const annotations = chart.options.plugins.annotation.annotations;
      for (let key in annotations) {
        const line = annotations[key];
        if (Math.abs(line.value - yValue) < 5) {
          return key;
        }
      }
      return null;
    };
  
    const handleMouseMove = (event) => {
      if (!isDragging || !draggedLine || !chartRef.current) return;
      const chart = chartRef.current;
      const position = getRelativePosition(event, chart);
      const newYValue = chart.scales['y'].getValueForPixel(position.y);
      if(draggedLine == "resistanceLine") {
        setResistanceLineValue(newYValue.toFixed(2))
      }
      if(draggedLine == "supportLine") {
        setsupportLineValue(newYValue.toFixed(2))
      }
      chart.options.plugins.annotation.annotations[draggedLine].value = newYValue;
      chart.update();
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedLine(null);
    };
    const handleMouseOver = (event) => {
        if (!chartRef.current) return;
        const chart = chartRef.current;
        const line = getLineAtEvent(event, chart);
        if (line) {
          chart.canvas.style.cursor = 'pointer';
        } else {
          chart.canvas.style.cursor = 'default';
        }
      };
  
    useEffect(() => {
      const chart = chartRef.current;
      if (!chart) return;
  
      chart.canvas.addEventListener('mousedown', handleMouseDown);
      chart.canvas.addEventListener('mousemove', handleMouseMove);
      chart.canvas.addEventListener('mouseup', handleMouseUp);
      chart.canvas.addEventListener('mousemove', handleMouseOver);
  
      return () => {
        if (chartRef.current) {
          chartRef.current.canvas.removeEventListener('mousedown', handleMouseDown);
          chartRef.current.canvas.removeEventListener('mousemove', handleMouseMove);
          chartRef.current.canvas.removeEventListener('mouseup', handleMouseUp);
          chartRef.current.canvas.removeEventListener('mousemove', handleMouseOver);
        }
      };
    }, [isDragging, draggedLine]);
    console.log(supportLineValue,`support value` ,resistanceLineValue, ` resistance value`)

    const handleThresholdSubmit =  async () => {
    if(supportLineValue == null || resistanceLineValue == null || supportLineValue <= resistanceLineValue) {
         return alert("To Save Your Threshold. You Need To Set Threshold First")
    }
     try {
    const res = await fetch("/api/updateThresholdValues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        aboveThreshold: supportLineValue,
        belowThreshold: resistanceLineValue,
      }),
    });

    if (res.ok) {
      const emailRes = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          aboveThreshold: supportLineValue,
          belowThreshold: resistanceLineValue,
        }),
      });

      if (emailRes.ok) {
        router.push("/");
        console.log("Your Record Saved and Email Sent Successfully");
      } else {
        const emailErrorData = await emailRes.json();
        console.error("Email Error:", emailErrorData.error);
      }
    } else {
      const errorData = await res.json();
      console.error("Error:", errorData.error);
    }
  } catch (error) {
    console.error("Error Message:", error);
  }
    }

  return (
    <div>
        <div className="graph">
      <h2>Graph</h2>
      <button onClick={() => handleThresholdSubmit()}>Submit Threshold</button>
      </div>
      <Line ref={chartRef} data={data} options={initialOptions} style={{ width: '100%', height: '600px' }} />
    </div>
  );
};

export default LineChart;
