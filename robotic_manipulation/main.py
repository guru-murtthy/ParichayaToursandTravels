from pipeline.vla_model import VLAModel
from simulation.pybullet_env import RoboticEnv
from pipeline.critic import SimpleCritic
from evaluation.metrics import Evaluator
import numpy as np
import time

COMMANDS = [
    "Move the blue block to the right of the green cube",
    "Pick up the red block and place it near the table edge",
    "Push the yellow block towards the blue block",
    "Stack the green block on top of the blue block",
    "Arrange the blocks in a row from left to right",
    "Place the red block between the blue and green blocks",
]

def run_command(vla, env, critic, evaluator, command, n_steps=20):
    print(f"\nExecuting: '{command}'")
    obs = env.get_observation()
    initial_positions = obs["block_positions"].copy()
    task_success = True
    
    for step in range(n_steps):
        action = vla.predict_action(obs["rgb"], command)
        env.apply_action(action)
        obs = env.get_observation()
        time.sleep(0.05)
        
    # Evaluate
    result = critic.check_goal_achieved(command, initial_positions, obs["block_positions"])
    goal_achieved = result["success"]
    
    if not goal_achieved:
        print(f" Failure detected: {result['failure_type']} — {result['details']}")
        print(" Attempting recovery...")
        recovery_cmd = f"Carefully {command}"
        for step in range(10):
            action = vla.predict_action(obs["rgb"], recovery_cmd)
            env.apply_action(action)
            obs = env.get_observation()
            
        result = critic.check_goal_achieved(command, initial_positions, obs["block_positions"])
        task_success = result["success"]
        
    evaluated_correctly = True  # simplified; in real eval: human annotation
    evaluator.record_trial(command, evaluated_correctly, task_success, goal_achieved, n_steps, n_steps)
    status = "SUCCESS" if task_success else "FAILED"
    print(f" Result: {status}")
    return task_success

if __name__ == "__main__":
    print("Initializing VTLA Robotic Manipulation System...")
    vla = VLAModel(model_path="openvla/openvla-7b")
    env = RoboticEnv(render=True)
    critic = SimpleCritic(position_threshold=0.05)
    evaluator = Evaluator()
    
    for command in COMMANDS:
        env.reset()
        run_command(vla, env, critic, evaluator, command)
        
    evaluator.print_report()
    error_summary = critic.get_error_summary()
    print(f"\nError Analysis: {error_summary['total_failures']} failures logged.")
    print("All results saved to error_log.json")
