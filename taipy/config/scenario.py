from typing import Callable, Dict, List, Optional

from taipy.common import protect_name
from taipy.config import PipelineConfig
from taipy.config.interface import ConfigRepository
from taipy.cycle.frequency import Frequency
from taipy.exceptions.scenario import NonExistingComparator


class ScenarioConfig:
    COMPARATOR_KEY = "comparators"

    def __init__(
        self, name: str, pipelines_configs: List[PipelineConfig], frequency: Optional[Frequency] = None, **properties
    ):
        self.name = protect_name(name)
        self.pipelines_configs = pipelines_configs
        self.frequency = frequency
        self.comparators: Optional[Dict[str, List[Callable]]] = None

        if self.COMPARATOR_KEY in properties.keys():
            self.comparators = properties[self.COMPARATOR_KEY]
            del properties[self.COMPARATOR_KEY]

        self.properties = properties

    def set_comparator(self, ds_config_name: str, comparator: Callable):
        if self.comparators:
            if ds_config_name in self.comparators.keys():
                self.comparators[ds_config_name].append(comparator)
            else:
                self.comparators[ds_config_name] = [comparator]
        else:
            self.comparators = {ds_config_name: [comparator]}

    def remove_comparator(self, ds_config_name: str):
        if self.comparators and ds_config_name in self.comparators.keys():
            del self.comparators[ds_config_name]
        else:
            raise NonExistingComparator


class ScenarioConfigs(ConfigRepository):
    def create(self, name: str, pipelines: List[PipelineConfig], frequency: Optional[Frequency] = None, **properties):  # type: ignore
        scenario_config = ScenarioConfig(name, pipelines, frequency=frequency, **properties)
        self._data[protect_name(name)] = scenario_config
        return scenario_config
