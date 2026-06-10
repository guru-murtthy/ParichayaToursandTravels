import pybullet as p
import pybullet_data
import numpy as np
import time

class RoboticEnv:
    """Franka Panda arm in tabletop environment with colored blocks."""
    BLOCK_COLORS = {
        "red": [0.9, 0.1, 0.1, 1],
        "blue": [0.1, 0.3, 0.9, 1],
        "green": [0.1, 0.8, 0.2, 1],
        "yellow": [0.9, 0.8, 0.1, 1],
    }

    def __init__(self, render=True):
        self.render = render
        self.physics_client = p.connect(p.GUI if render else p.DIRECT)
        p.setAdditionalSearchPath(pybullet_data.getDataPath())
        p.setGravity(0, 0, -9.81)
        self.block_ids = {}
        self.robot_id = None
        self._setup_scene()

    def _setup_scene(self):
        p.loadURDF("plane.urdf")
        # Table
        table_vis = p.createVisualShape(p.GEOM_BOX, halfExtents=[0.4, 0.4, 0.02], rgbaColor=[0.8, 0.7, 0.6, 1])
        table_col = p.createCollisionShape(p.GEOM_BOX, halfExtents=[0.4, 0.4, 0.02])
        p.createMultiBody(baseMass=0, baseVisualShapeIndex=table_vis, baseCollisionShapeIndex=table_col, basePosition=[0.5, 0, 0.4])
        # Robot
        self.robot_id = p.loadURDF(
            "franka_panda/panda.urdf",
            [0, 0, 0.4],
            p.getQuaternionFromEuler([0, 0, 0]),
            useFixedBase=True
        )
        self._reset_robot()
        self._spawn_blocks()

    def _reset_robot(self):
        """Home position for Franka Panda (7 joints + 2 finger joints)."""
        home_joints = [0, -0.785, 0, -2.356, 0, 1.571, 0.785, 0.04, 0.04]
        for i, angle in enumerate(home_joints):
            p.resetJointState(self.robot_id, i, angle)

    def _spawn_blocks(self):
        block_positions = {
            "blue": [0.5, -0.1, 0.45],
            "green": [0.5, 0.1, 0.45],
            "red": [0.4, -0.05, 0.45],
            "yellow": [0.6, 0.05, 0.45],
        }
        for color, pos in block_positions.items():
            vis = p.createVisualShape(p.GEOM_BOX, halfExtents=[0.025]*3, rgbaColor=self.BLOCK_COLORS[color])
            col = p.createCollisionShape(p.GEOM_BOX, halfExtents=[0.025]*3)
            bid = p.createMultiBody(baseMass=0.1, baseVisualShapeIndex=vis, baseCollisionShapeIndex=col, basePosition=pos)
            self.block_ids[color] = bid

    def get_observation(self) -> dict:
        """Returns RGB image + block positions for critic."""
        width, height = 640, 480
        view_matrix = p.computeViewMatrix([1.2, 0, 1.0], [0.5, 0, 0.45], [0, 0, 1])
        proj_matrix = p.computeProjectionMatrixFOV(60, width/height, 0.1, 10)
        _, _, rgb, depth, _ = p.getCameraImage(width, height, view_matrix, proj_matrix)
        rgb_array = np.array(rgb, dtype=np.uint8)[:, :, :3]
        block_positions = {
            c: p.getBasePositionAndOrientation(bid)[0] for c, bid in self.block_ids.items()
        }
        return {"rgb": rgb_array, "block_positions": block_positions}

    def apply_action(self, action: np.ndarray):
        """Apply 7-DoF end-effector delta action via inverse kinematics."""
        ee_link = 11  # Franka end-effector link index
        current_pos = np.array(p.getLinkState(self.robot_id, ee_link)[0])
        target_pos = current_pos + action[:3] * 0.05  # scale delta
        joint_poses = p.calculateInverseKinematics(
            self.robot_id, ee_link, target_pos, maxNumIterations=100, residualThreshold=1e-5
        )
        for i, jp in enumerate(joint_poses[:7]):
            p.setJointMotorControl2(self.robot_id, i, p.POSITION_CONTROL, targetPosition=jp, force=500)
        # Gripper
        gripper_val = 0.04 if action[6] > 0 else 0.0
        p.setJointMotorControl2(self.robot_id, 9, p.POSITION_CONTROL, targetPosition=gripper_val, force=100)
        p.setJointMotorControl2(self.robot_id, 10, p.POSITION_CONTROL, targetPosition=gripper_val, force=100)
        for _ in range(10):
            p.stepSimulation()

    def reset(self):
        p.resetSimulation()
        p.setGravity(0, 0, -9.81)
        self._setup_scene()
