import numpy as np
import json
from datetime import datetime

class SimpleCritic:
    """
    Lightweight failure detector. Compares goal state vs observed state. In production,
    replace with fine-tuned RoboFAC-style VLM (8B params).
    """
    def __init__(self, position_threshold=0.05, log_path="error_log.json"):
        self.threshold = position_threshold
        self.log_path = log_path
        self.error_log = []

    def check_goal_achieved(self, command: str, initial_positions: dict, current_positions: dict) -> dict:
        """ Returns: {"success": bool, "failure_type": str, "details": str} """
        # Parse spatial intent from command
        intent = self._parse_spatial_intent(command)
        if intent["action"] == "move_relative":
            obj = intent["object"]
            ref = intent["reference"]
            direction = intent["direction"]
            if obj not in current_positions or ref not in current_positions:
                return self._log_failure("object_not_found", f"Cannot locate {obj} or {ref}", command)
            
            obj_pos = np.array(current_positions[obj])
            ref_pos = np.array(current_positions[ref])
            
            # Check spatial relationship
            if direction == "right" and obj_pos[1] < ref_pos[1] - self.threshold:
                return self._log_failure("position_error", f"{obj} should be right of {ref}", command)
            elif direction == "left" and obj_pos[1] > ref_pos[1] + self.threshold:
                return self._log_failure("position_error", f"{obj} should be left of {ref}", command)
        
        # Check if any object moved unexpectedly
        for obj, pos in current_positions.items():
            if obj in initial_positions:
                dist = np.linalg.norm(np.array(pos) - np.array(initial_positions[obj]))
                if dist > 0.3:  # large unexpected movement
                    return self._log_failure("unintended_movement", f"{obj} moved {dist:.3f}m unexpectedly", command)
                    
        return {"success": True, "failure_type": None, "details": "Goal achieved"}

    def _parse_spatial_intent(self, command: str) -> dict:
        colors = ["blue", "green", "red", "yellow"]
        directions = ["right", "left", "above", "below", "front", "behind"]
        intent = {"action": "unknown", "object": None, "reference": None, "direction": None}
        cmd_lower = command.lower()
        
        found_colors = [c for c in colors if c in cmd_lower]
        found_dirs = [d for d in directions if d in cmd_lower]
        
        if len(found_colors) >= 1:
            intent["object"] = found_colors[0]
        if len(found_colors) >= 2:
            intent["reference"] = found_colors[1]
        if found_dirs:
            intent["direction"] = found_dirs[0]
        if any(w in cmd_lower for w in ["move", "place", "put"]):
            intent["action"] = "move_relative"
            
        return intent

    def _log_failure(self, failure_type, details, command):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "command": command,
            "failure_type": failure_type,
            "details": details,
            "recovered": False
        }
        self.error_log.append(entry)
        with open(self.log_path, "w") as f:
            json.dump(self.error_log, f, indent=2)
        return {"success": False, "failure_type": failure_type, "details": details}

    def get_error_summary(self) -> dict:
        total = len(self.error_log)
        by_type = {}
        for e in self.error_log:
            t = e["failure_type"]
            by_type[t] = by_type.get(t, 0) + 1
        return {"total_failures": total, "by_type": by_type, "error_log": self.error_log}
