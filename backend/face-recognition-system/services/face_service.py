from pipelines.full_pipeline import run_pipeline
from utils.data_manager import create_case, save_case_result


class FaceService:

    def compare(self, img1_path, img2_path, case_id=None):
        result = run_pipeline(img1_path, img2_path)

        if "error" in result:
            return result

        score = result["similarity_score"]

        response = {
            "similarity_score": score,
            "confidence_level": self.interpret(score)
        }

        # se tiver caso → salva
        if case_id:
            create_case(case_id)
            save_case_result(case_id, response)

        return response

    def interpret(self, score):
        if score > 0.65:
            return "alta similaridade"
        elif score > 0.45:
            return "moderada"
        else:
            return "baixa"