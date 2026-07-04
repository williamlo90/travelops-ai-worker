from collections.abc import Callable
from typing import Any

from pydantic import BaseModel


class UnknownTool(LookupError):
    pass


class RegisteredTool:
    def __init__(
        self,
        *,
        name: str,
        input_model: type[BaseModel],
        output_model: type[BaseModel],
        handler: Callable[[Any], BaseModel],
        has_side_effect: bool = False,
    ) -> None:
        self.name = name
        self.input_model = input_model
        self.output_model = output_model
        self.handler = handler
        self.has_side_effect = has_side_effect

    def invoke(self, payload: dict[str, Any]) -> BaseModel:
        validated_input = self.input_model.model_validate(payload)
        result = self.handler(validated_input)
        return self.output_model.model_validate(result)


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, RegisteredTool] = {}

    def register(self, tool: RegisteredTool) -> None:
        if tool.name in self._tools:
            raise ValueError(f"Tool {tool.name!r} is already registered.")
        self._tools[tool.name] = tool

    def get(self, name: str) -> RegisteredTool:
        try:
            return self._tools[name]
        except KeyError as error:
            raise UnknownTool(f"Tool {name!r} is not registered.") from error

    def invoke(self, name: str, payload: dict[str, Any]) -> BaseModel:
        return self.get(name).invoke(payload)

    @property
    def names(self) -> tuple[str, ...]:
        return tuple(sorted(self._tools))
