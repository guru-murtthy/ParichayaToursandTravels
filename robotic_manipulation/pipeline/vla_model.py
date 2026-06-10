import torch
from transformers import AutoModelForVision2Seq, AutoProcessor
from PIL import Image
import numpy as np

class VLAModel:
    """OpenVLA wrapper — no BERT, no Detectron2. Native multimodal."""
    def __init__(self, model_path="openvla/openvla-7b", device="cuda"):
        self.device = device
        print(f"Loading OpenVLA from {model_path}...")
        self.processor = AutoProcessor.from_pretrained(
            model_path, trust_remote_code=True
        )
        self.model = AutoModelForVision2Seq.from_pretrained(
            model_path,
            attn_implementation="flash_attention_2",  # faster
            torch_dtype=torch.bfloat16,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        ).to(device)
        print("Model loaded successfully.")

    def predict_action(self, image: np.ndarray, instruction: str) -> np.ndarray:
        """
        Args:
            image: RGB image (H, W, 3) uint8
            instruction: natural language command string
        Returns:
            action: 7-DoF array [dx, dy, dz, droll, dpitch, dyaw, gripper]
        """
        pil_image = Image.fromarray(image)
        # Build prompt — OpenVLA format
        prompt = f"In: What action should the robot take to {instruction}?\nOut:"
        inputs = self.processor(prompt, pil_image).to(
            self.device, dtype=torch.bfloat16
        )
        # Auto-regressive action token generation
        action_tokens = self.model.predict_action(
            **inputs,
            unnorm_key="bridge_orig",
            do_sample=False
        )
        return action_tokens.cpu().numpy()

    def batch_predict(self, images, instructions):
        """Run multiple commands — useful for evaluation loops."""
        return [self.predict_action(img, inst) for img, inst in zip(images, instructions)]
