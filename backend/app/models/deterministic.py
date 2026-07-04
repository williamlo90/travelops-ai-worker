from app.domain.proposals import IntentClassification
from app.models.gateway import ClassificationRequest


class DeterministicModelGateway:
    provider_name = "deterministic"
    model_version = "rules-v1"

    def classify(self, request: ClassificationRequest) -> IntentClassification:
        normalized = request.customer_message.lower()
        cause = (
            "carrier_cancellation"
            if "cancel" in normalized or "cancelled" in normalized
            else "unknown"
        )
        return IntentClassification(intent="refund", cause=cause, confidence=1.0)
