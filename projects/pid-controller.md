---
title: PID Controller Design Project
date: December 2025
category: Control Systems Engineering
status: MATLAB & Simulink
tags:
  - MATLAB / Simulink
  - C/C++ Firmware
  - STM32 MCU
  - Active Stabilization
video: pid-simulation.mp4
video_description: Dynamic system response simulation comparing open-loop vs closed-loop PID control performance.
image: ../assets/projects/Placeholder.png
image_description: MATLAB Response Plot
specs:
  - Proportional Gain (Kp)|1.85
  - Integral Gain (Ki)|0.45
  - Derivative Gain (Kd)|0.12
  - Max Overshoot Limit|< 5.0 %
  - Bandwidth Resolution|100 Hz
---

## Project Overview
This project showcases the modeling, testing, and deployment of a PID feedback control loop. Precise positioning and vibration dampening are critical in modern electromechanical assemblies. By constructing a dynamic system model, we tuned PID parameters to minimize overshoot, settle rapidly, and eliminate steady-state error under shifting load conditions.

> **Control Philosophy:** Proper filtering of the derivative component (using low-pass first-order filters) is critical to prevent high-frequency sensor noise from saturating the actuator input.

## System Modeling & Simulation
The control system was modeled in MATLAB and Simulink using transfer functions representing the plant dynamics. The controller characteristics were optimized iteratively:

* **Proportional Gain (Kp):** Establishes the rise time and responsiveness to active error offsets.
* **Integral Gain (Ki):** Accumulates past error offsets to remove persistent steady-state tracking deviations.
* **Derivative Gain (Kd):** Predicts future error trends to provide damping, stabilizing oscillations.

## Firmware Implementation
The code snippet below illustrates a discrete-time execution of the PID algorithm implemented in C on an STM32 microcontroller:

```c
// Discrete PID Controller Algorithm
float ComputePID(float setpoint, float current_val, float dt) {
    float error = setpoint - current_val;
    
    // Proportional term
    float P_val = Kp * error;
    
    // Integral term (with windup protection limit)
    integral += error * dt;
    if (integral > INTEGRAL_LIMIT) integral = INTEGRAL_LIMIT;
    else if (integral < -INTEGRAL_LIMIT) integral = -INTEGRAL_LIMIT;
    float I_val = Ki * integral;
    
    // Derivative term (with noise filtering)
    float derivative = (error - last_error) / dt;
    float D_val = Kd * derivative;
    
    last_error = error;
    return P_val + I_val + D_val;
}
```

## Results & Validation
Hardware testing using real-time hardware-in-the-loop (HIL) simulators and oscilloscopes confirmed the modeled results:

1. Overshoot was successfully restricted to less than 5%.
2. The system achieved a settling time of under 0.8 seconds under full-load conditions.
3. Steady-state positioning error collapsed to absolute zero within resolution limits.
