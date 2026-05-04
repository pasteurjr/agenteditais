from typing import Dict, Optional, Any
from pathlib import Path


class FrameworkAdapterFactory:
    """Factory para selecionar o conjunto de adaptadores do framework"""

    @staticmethod
    def get_framework_adapters(
        version: str = "frameworkagentsadapter", api_key: Optional[str] = None
    ):
        """
        Retorna as classes de adaptadores do framework na versão especificada

        Args:
            version: Versão do framework adapter ("frameworkagentsadapter", "autogenadapter", etc)
            api_key: API key para serviços que necessitem (como OpenAI)

        Returns:
            Dict contendo todas as classes do adapter selecionado
        """
        if version == "frameworkagentsadapter":
            from frameworkagentsadapterant4 import (
                LangChainAgentMemorySystem,
                AiTeamAgentAdapter,
                AiTeamTaskAdapter,
                AiTeamTeamAdapter,
                AiTeamToolAdapter,
                AiTeamSystemAdapter,
                AiTeamSystemFacade,
                AiTeamComponentFactory,
                AiTeamTaskFactory,
                AiTeamAgentFactory,
                AiTeamTeamFactory,
                AiTeamToolFactory,
                AiTeamTaskObserverAdapter,
                AiTeamAgentObserverAdapter,
            )

            return {
                "memory_system": LangChainAgentMemorySystem,
                "agent": AiTeamAgentAdapter,
                "task": AiTeamTaskAdapter,
                "team": AiTeamTeamAdapter,
                "tool": AiTeamToolAdapter,
                "system": AiTeamSystemAdapter,
                "system_facade": AiTeamSystemFacade,
                "component_factory": AiTeamComponentFactory,
                "task_factory": AiTeamTaskFactory,
                "agent_factory": AiTeamAgentFactory,
                "team_factory": AiTeamTeamFactory,
                "tool_factory": AiTeamToolFactory,
                "task_observer": AiTeamTaskObserverAdapter,
                "agent_observer": AiTeamAgentObserverAdapter,
            }

        elif version == "autogenadapter":
            # Futuro: importar classes do adapter do AutoGen
            raise NotImplementedError("AutoGen Adapter ainda não implementado")

        else:
            raise ValueError(f"Versão de framework adapter desconhecida: {version}")
