//use lazy_static::lazy_static;
//use primal_sieve::Sieve;
use std::u16;
use web_sys::console;
use std::fmt;

use serde::{Deserialize, Serialize};
use serde_json::Result;

use std::collections::HashMap;


mod utils;

#[wasm_bindgen]
pub fn init() {
    utils::init();
    //console::log_1(&"Hello from WebAssembly!".into());
}
/*
lazy_static! {
    static ref SIEVE: Sieve = Sieve::new(u16::MAX as usize);
}

#[wasm_bindgen]
pub fn is_prime(number: u16) -> bool {
    SIEVE.is_prime(number as usize)
}

*/


use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    return format!("Hello, {}!", name);
}

/*
    TODO : 

        - aan Flowrunner.new array meegeven met parameters
        - alle parameters mappen naar indexen
            - start met input parameter
                add to parameter mappings Vec
            - loop door flow
                voor elke getParameter
                    is mapped? 
                        assign index
                    is not mapped
                        add to parameter mappings
                        assign index

            [HIER GEBLEVEN]
            - in convert execute :
                parameter waardes vertalen mbv parameterMapping...

            - in matrixtask
                outside loop : map string parameter to indexes
                inside loop : use parameter indexes




        - tijd meten diverse stappen
            - omschrijven code zodat er geen modulo gebruikt wordt
                ziehttps://rustwasm.github.io/book/game-of-life/time-profiling.html


        - clean up : remove greet/prime/universe etc...
        
        - do we need web_sys::console??

        - Flow met impl implementeren en init method tbv initialisatie/conversie vanuit json
        - Flow methods

            - initialise(jsonFlow)

            - clearParametersStore
            - setParameter (index, name, value) : voor elk Type apart implementeren? 
                - setParameterInt etc
            - if/operator tasks specifiek maken voor parameters
            - getParameter aanpassen

            - executeFlow

            - optimaliseren hashmap ?
                https://github.com/Amanieu/hashbrown
                
                - indien mogelijk uberhaupt geen hashmap gebruiken


            - optimaliseren javascript - webasm interface
                - geen strings gebruiken maar rechtstreeks geheugen  https://engineering.widen.com/blog/A-Tale-of-Performance-Javascript,-Rust,-and-WebAssembly/
                - kunnen we arrays van uints doorsturen via functie?

                https://medium.com/wasm/strings-in-webassembly-wasm-57a05c1ea333

                kunnen we de flow converteren naar een formaat waarbij voor de flow-functions
                    geen strings nodig zijn maar integer constants/enum?

                    - maar ook de flow step names naar integers omzetten

*/

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Flow {
    
    flow: Vec<FlowNodeRaw>,
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FlowTask {
    Nop = 0,
    Assign = 1,
    Matrix = 2,
    SetVariable = 3,
    GetVariable = 4,
    GetParameter = 5,
    Operation = 6,
    OperationVariable = 7,
    If = 8

}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FlowTaskCondition {
    Nop = 0,
    Equals = 1,
    LowerEquals = 2,
    Lower = 3,
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FlowTaskMode {
    Nop = 0,
    IntegerMode = 1,
    FloatMode = 2,
    StringMode = 3,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FlowNodeRaw {
    name: String,
    taskName: String,

    #[serde(default)]
    operator: String,
    
    #[serde(default)]
    value: String,

    #[serde(default)]
    valueInt: u32,

    #[serde(default)]
    valueFloat: f64,

    #[serde(default)]
    next: String,

    #[serde(default)]
    elseStep: String,

    #[serde(default)]
    mode: String,

    #[serde(default)]
    condition: String,

    #[serde(default)]
    parameterName: String,

    #[serde(default)]
    variableName: String,

    #[serde(default)]
    eventStepName: String

}

#[derive(Clone)]
pub struct FlowNode {
    name: usize,
    taskName: FlowTask,
    operator: String,
    value: String,
    valueInt: u32,
    valueFloat: f64,
    next: usize,
    elseStep: usize,
    mode: FlowTaskMode,
    condition: FlowTaskCondition,
    parameterName: String,
    parameterIndex: usize,
    variableName: String,
    eventStepName: usize
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Value {
    #[serde(default)]
    value: String,

    #[serde(default)]
    valueInt: u32,

    #[serde(default)]
    valueFloat: f64,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Payload {
    value: String,
    valueInt: u32,
    valueFloat: f64
}

#[wasm_bindgen]
pub struct Flowrunner {

    flow: Vec<FlowNode>,
    parameters: HashMap<String, usize>
}

#[wasm_bindgen]
impl Flowrunner {

    fn get_index(&self, columns : u32, row: u32, column: u32) -> usize {
        (row * columns + column) as usize
    }

    fn live_neighbor_count(&self, cells: &Vec<Cell>, rows : u32, columns: u32, row: u32, column: u32) -> u32 {
        let mut count = 0;
        for delta_row in [rows - 1, 0, 1].iter().cloned() {
            for delta_col in [columns - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % rows;
                let neighbor_col = (column + delta_col) % columns;
                let idx = self.get_index(columns, neighbor_row, neighbor_col);
                count += cells[idx] as u32;
            }
        }
        count
    }

    fn getMatrixTask(
        &self,
        flowNode: &FlowNode, 
        payload: &mut Payload, 
        parameters: & HashMap<usize,Value>,
        variableStore: &mut HashMap<String, Value> 
    ) {
        let mut columns : u32 = 0;
        let mut rows : u32 = 0;
        let mut data : String = "".to_string();
        let mut dataLength : u32 = 0;

        //let mut parameterValues : HashMap<usize,Value> = HashMap::new();

        match self.parameters.get(&"columns".to_string()) {
            Some(parameter) => {

                match parameters.get(parameter) {
                    Some(value) => {
                        columns = value.valueInt;
                    }
                    None => {

                    }
                }                    
            }
            None => {

            }
        } 

        match self.parameters.get(&"rows".to_string()) {
            Some(parameter) => {
                match parameters.get(parameter) {
                    Some(value) => {
                        rows = value.valueInt;
                    }
                    None => {

                    }
                }         
            }
            None => {

            }
        }
        
        match self.parameters.get(&"data".to_string()) {
            Some(parameter) => {
                match parameters.get(parameter) {
                    Some(value) => {
                        data = value.value.to_string();
                    }
                    None => {

                    }
                }  
                    
            }
            None => {

            }
        }

        //console::log_1(&format!("parameter {:?}", columns).to_string().into());

        if columns > 0 && rows > 0 && data.len() == (rows * columns) as usize {
            payload.value = "data equals matrix size".to_string();

            if flowNode.eventStepName == usize::MAX {
                return;
            }
            let cells = (0..columns * rows)
            .map(|i| {
                //if i % 2 == 0 || i % 7 == 0 {
                if data.as_bytes()[i as usize] == 49 {  
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

            let mut localParameters : HashMap<usize, Value> = HashMap::new();
            let mut neighbourCountParameter : usize = usize::MAX;
            let mut cellParameter : usize = usize::MAX;

            match self.parameters.get(&"neighbourCount".to_string()) {
                Some(parameter) => {
                    neighbourCountParameter = *parameter;                        
                }
                None => {
    
                }
            }
            match self.parameters.get(&"cell".to_string()) {
                Some(parameter) => {
                    cellParameter = *parameter;                        
                }
                None => {
    
                }
            }

            
            // "neighbourCount"
            // "cell"
            dataLength = rows * columns;
            let mut nextData : String = "".to_string();
            let mut loopVar : u32 = 0;
            
            

            while loopVar < dataLength {
                let mut queue : Vec<usize> = Vec::new();
                let mut currentStep : usize = flowNode.eventStepName;
                let mut payloadForMatrix : Payload = Payload {
                    value : "".to_string(),
                    valueInt : 0,
                    valueFloat : 0.0
                };
                if currentStep != usize::MAX {
                    let mut continueWhile : bool = true;
                    
                    let mut neighbourCount : Value = Value {
                        value : "".to_string(),
                        valueInt : 0,
                        valueFloat : 0.0
                    };
        
                    let mut cell : Value = Value {
                        value : "".to_string(),
                        valueInt : 0,
                        valueFloat : 0.0
                    };

                    neighbourCount.valueInt = self.live_neighbor_count(&cells , rows, columns , loopVar / columns, loopVar % columns );                    
                    
                    let idx = self.get_index(columns, loopVar / columns, loopVar % columns);
                    cell.valueInt = if cells[idx] == Cell::Alive { 1 } else { 0 };

                    localParameters.insert(neighbourCountParameter, neighbourCount);
                    localParameters.insert(cellParameter, cell);
                    
                    while continueWhile {
                        let _returnString = self.executeFlowStep(
                            currentStep, 
                            &mut queue, 
                            &mut payloadForMatrix,
                            &localParameters,
                            variableStore
                        );
                        continueWhile = queue.len() > 0;
                        if continueWhile {
                            currentStep = queue[0];
                            queue.remove(0);
                        }
                    }
                    
                    nextData.push_str(&payloadForMatrix.value);
                }
                
                loopVar = loopVar + 1;
            }

            payload.value = nextData.to_string();
        } else {
            payload.value = format!("data NOT equals matrix size, {}!", data.len());
            //payload.value = "data NOT equals matrix size".to_string();
        }
    }

    fn getParameterTask(
        &self,
        flowNode: &FlowNode, 
        payload: &mut Payload, 
        parameters: & HashMap<usize,Value> 
    ) {
        match parameters.get(&flowNode.parameterIndex) {
            Some(parameter) => {
                if flowNode.mode == FlowTaskMode::IntegerMode {
                    payload.valueInt = parameter.valueInt;
                } else 
                if flowNode.mode == FlowTaskMode::FloatMode {
                    payload.valueFloat = parameter.valueFloat;
                } else {
                    payload.value = parameter.value.to_string();
                }    
            }
            None => {

            }
        }   
    }

    fn getVariableTask(
        &self,
        flowNode: &FlowNode, 
        payload: &mut Payload, 
        variableStore: &mut HashMap<String, Value> 
    ) {
        match variableStore.get(&flowNode.variableName.to_string()) {
            Some(variable) => {
                if flowNode.mode == FlowTaskMode::IntegerMode {
                    payload.valueInt = variable.valueInt;
                } else 
                if flowNode.mode == FlowTaskMode::FloatMode {
                    payload.valueFloat = variable.valueFloat;
                } else {
                    payload.value = variable.value.to_string();
                }    
            }
            None => {
                //payload.value = format!("getVariableTask variable not found, {}!", flowNode.variableName.to_string());
            }
        }   
    }
    fn setVariableTask(
        &self,
        flowNode: &FlowNode, 
        payload: &mut Payload, 
        variableStore: &mut HashMap<String, Value> 
    ) {
        let mut value : Value = Value {
            value : "".to_string(),
            valueInt : 0,
            valueFloat : 0.0
        };

        if flowNode.mode == FlowTaskMode::IntegerMode {
            value.valueInt = payload.valueInt;
        } else 
        if flowNode.mode == FlowTaskMode::FloatMode {
            value.valueFloat = payload.valueFloat;
        } else {
            value.value = payload.value.to_string();
        }   

        variableStore.insert(flowNode.variableName.to_string(), value);
    }

    fn assignTask(&self,flowNode: &FlowNode, payload: &mut Payload) {
        if flowNode.mode == FlowTaskMode::IntegerMode {
            payload.valueInt = flowNode.valueInt;
        } else {
            payload.value = flowNode.value.to_string();
        }    
    }

    fn operationTask(&self, flowNode: &FlowNode, payload: &mut Payload) {
        if flowNode.operator.to_string() == "add".to_string() {
            if flowNode.mode == FlowTaskMode::IntegerMode {
                payload.valueInt = payload.valueInt + flowNode.valueInt;
            } else
            if flowNode.mode == FlowTaskMode::FloatMode {
                payload.valueFloat = payload.valueFloat + flowNode.valueFloat;
            } else {
                payload.value.push_str(&flowNode.value.to_string())
            }
        } else
        if flowNode.operator.to_string() == "product".to_string() {
            if flowNode.mode == FlowTaskMode::IntegerMode {
                payload.valueInt = payload.valueInt * flowNode.valueInt;
            } else
            if flowNode.mode == FlowTaskMode::FloatMode {
                payload.valueFloat = payload.valueFloat * flowNode.valueFloat;
            }
        } else
        if flowNode.operator.to_string() == "divide".to_string() {
            if flowNode.mode == FlowTaskMode::IntegerMode  {
                payload.valueInt = payload.valueInt / flowNode.valueInt;
            } else
            if flowNode.mode == FlowTaskMode::FloatMode {
                payload.valueFloat = payload.valueFloat / flowNode.valueFloat;
            }
        } else
        if flowNode.operator.to_string() == "modulo".to_string() {
            if flowNode.mode == FlowTaskMode::IntegerMode  {
                payload.valueInt = payload.valueInt % flowNode.valueInt;
            } 
        }
    }

    fn operationVariableTask(
        &self,
        flowNode: &FlowNode, 
        payload: &mut Payload,
        variableStore: &mut HashMap<String, Value>) {

            match variableStore.get(&flowNode.variableName.to_string()) {
                Some(variable) => {                  
                    if flowNode.operator.to_string() == "add".to_string() {
                        if flowNode.mode == FlowTaskMode::IntegerMode {
                            payload.valueInt = payload.valueInt + variable.valueInt;
                        } else
                        if flowNode.mode == FlowTaskMode::FloatMode {
                            payload.valueFloat = payload.valueFloat + variable.valueFloat;
                        } else  {
                            payload.value.push_str(&variable.value.to_string())
                        }
                    } else
                    if flowNode.operator.to_string() == "product".to_string() {
                        if flowNode.mode == FlowTaskMode::IntegerMode  {
                            payload.valueInt = payload.valueInt * variable.valueInt;
                        } else
                        if flowNode.mode == FlowTaskMode::FloatMode {
                            payload.valueFloat = payload.valueFloat * variable.valueFloat;
                        }
                    } else
                    if flowNode.operator.to_string() == "divide".to_string() {
                        if flowNode.mode == FlowTaskMode::IntegerMode  {
                            payload.valueInt = payload.valueInt / variable.valueInt;
                        } else
                        if flowNode.mode == FlowTaskMode::FloatMode {
                            payload.valueFloat = payload.valueFloat / variable.valueFloat;
                        }
                    } else
                    if flowNode.operator.to_string() == "modulo".to_string() {
                        if flowNode.mode == FlowTaskMode::IntegerMode  {
                            payload.valueInt = payload.valueInt % variable.valueInt;
                        }
                    }

            }
            None => {
                //payload.value = "operationVariableTask variable not found".to_string();
            }
        }   

    }

    fn executeFlowStep(
        &self,
        currentStep: usize, 
        queue : &mut Vec<usize>, 
        payload: &mut Payload,
        parameters: & HashMap<usize,Value>,
        variableStore: &mut HashMap<String, Value>
    ) {

        let flowNode : FlowNode = self.flow[currentStep].clone();
        let mut gotoNextStep = false;
        
        if flowNode.taskName == FlowTask::Assign {
            self.assignTask(&flowNode, payload);
            gotoNextStep = true;
        } else
        if flowNode.taskName == FlowTask::Matrix {
            self.getMatrixTask(&flowNode, payload, parameters, variableStore);
            gotoNextStep = true;
        } else
        if flowNode.taskName == FlowTask::GetParameter {
            self.getParameterTask(&flowNode, payload, parameters);
            gotoNextStep = true;
        } else
        if flowNode.taskName == FlowTask::GetVariable {
            self.getVariableTask(&flowNode, payload, variableStore);
            gotoNextStep = true;
        } else
        if flowNode.taskName == FlowTask::SetVariable {
            self.setVariableTask(&flowNode, payload, variableStore);
            gotoNextStep = true;
        } else
        if flowNode.taskName == FlowTask::Operation {
            self.operationTask(&flowNode, payload);
            gotoNextStep = true;
        } else
        if flowNode.taskName == FlowTask::OperationVariable {
            self.operationVariableTask(&flowNode, payload, variableStore);
            gotoNextStep = true;
        } else            
        if flowNode.taskName == FlowTask::If {
            if flowNode.mode == FlowTaskMode::IntegerMode {
                if flowNode.condition == FlowTaskCondition::Equals {                        
                    if flowNode.valueInt == payload.valueInt {
                        gotoNextStep = true;
                    } else {
                        if flowNode.elseStep >= 0 {
                            queue.push(flowNode.elseStep);
                        }
                    }
                } else
                if flowNode.condition == FlowTaskCondition::LowerEquals {  
                    if payload.valueInt <= flowNode.valueInt {
                        gotoNextStep = true;
                    } else {
                        if flowNode.elseStep >= 0 {
                            queue.push(flowNode.elseStep);
                        }
                    }
                } else
                if flowNode.condition == FlowTaskCondition::Lower {  
                    if payload.valueInt < flowNode.valueInt {
                        gotoNextStep = true;
                    } else {
                        if flowNode.elseStep >= 0 {
                            queue.push(flowNode.elseStep);
                        }
                    }
                }

            }
        }
        
        if gotoNextStep {
            if flowNode.next != usize::MAX {
                queue.push(flowNode.next);
            }
        }            

    }

    pub fn convert(&self, parametersJson: &str) -> JsValue {

        let mut parameters : HashMap<String, Value> = HashMap::new();
        let mut variableStore: HashMap<String, Value> = HashMap::new();
        let mut parameterValues : HashMap<usize,Value> = HashMap::new();
        
        let mut queue : Vec<usize> = Vec::new();
        let mut payload : Payload = Payload {
            value : "".to_string(),
            valueInt : 0,
            valueFloat : 0.0
        };

        parameters =  serde_json::from_str(parametersJson).unwrap();
        for (key, value) in parameters.iter() {        
            match self.parameters.get(&key.to_string()) {
                Some(parameter) => {
                    parameterValues.insert(*parameter, value.clone()); 

                    //console::log_1(&format!("parameter {} {:?} {:?}",&key.to_string(), *parameter, value.valueInt).to_string().into());
                }
                None => {
                    
                }
            }
        }

        let mut currentStep : usize = 0;
        let mut continueWhile : bool = true;
        while continueWhile {
            self.executeFlowStep(
                currentStep, 
                &mut queue, 
                &mut payload,
                &parameterValues,
                &mut variableStore
            );
            continueWhile = queue.len() > 0;
            if continueWhile {
                currentStep = queue[0];
                queue.remove(0);
            }
        } 
        JsValue::from_serde(&payload).unwrap()
    }

    pub fn test(&self) {
        console::log_1(&format!("lengte {}", self.flow.len()).to_string().into());
        console::log_1(&format!("stap0 taskName {:?}", self.flow[0].next).to_string().into());
    }
    pub fn new(parametersJson: &str, inputJson: &str) -> Flowrunner {

        let mut parameters : Vec<String> = Vec::new();
        let mut parametersMap : HashMap<String, usize> = HashMap::new();

        let mut flowStepsRaw : HashMap<String, FlowNodeRaw> = HashMap::new();
        let mut flowSteps : HashMap<String, FlowNode> = HashMap::new();
        
        parameters =  serde_json::from_str(parametersJson).unwrap();

        let mut parameterIndex : usize = 0;
        for parameter in &parameters {
            match parametersMap.get(&parameter.to_string()) {
                Some(parameterName) => {
                    //
                }
                None => {
                    parametersMap.insert(parameter.to_string(), parameterIndex);
                    parameterIndex = parameterIndex + 1;
                }
            }
        }
        console::log_1(&format!("parameters lengte {}", parameters.len()).to_string().into());

        let v : Flow;
        v = serde_json::from_str(inputJson).unwrap();
        let mut flow : Vec<FlowNode> = Vec::new();

        //let mut returnString = String::from("");
        for x in &v.flow {
            let mut flowNode : FlowNode = FlowNode {
                taskName : FlowTask::Nop,
                name : flow.len(),
                operator: x.operator.to_string(), 
                value: x.value.to_string(),
                valueInt: x.valueInt,
                valueFloat: x.valueFloat,
                next: usize::MAX,
                elseStep: usize::MAX,
                mode: FlowTaskMode::Nop,
                condition: FlowTaskCondition::Nop,
                parameterName: x.parameterName.to_string(),
                variableName: x.variableName.to_string(),
                eventStepName: usize::MAX,
                parameterIndex : usize::MAX
            };

            if x.taskName == "assign".to_string() {
                flowNode.taskName = FlowTask::Assign;
            } else
            if x.taskName == "getParameter".to_string() {
                flowNode.taskName = FlowTask::GetParameter;

                match parametersMap.get(&x.parameterName.to_string()) {
                    Some(parameter) => {
                        flowNode.parameterIndex = *parameter;
                    }
                    None => {
                        parametersMap.insert(x.parameterName.to_string(), parameterIndex);
                        flowNode.parameterIndex = parameterIndex;
                        parameterIndex = parameterIndex + 1;
                    }
                }
            }  else
            if x.taskName == "setVariable".to_string() {
                flowNode.taskName = FlowTask::SetVariable;
            } else
            if x.taskName == "getVariable".to_string() {
                flowNode.taskName = FlowTask::GetVariable;
            } else
            if x.taskName == "matrix".to_string() {
                flowNode.taskName = FlowTask::Matrix;
            } else
            if x.taskName == "operation".to_string() {
                flowNode.taskName = FlowTask::Operation;
            } else
            if x.taskName == "operationVariable".to_string() {
                flowNode.taskName = FlowTask::OperationVariable;
            } else             
            if x.taskName == "if".to_string() {
                flowNode.taskName = FlowTask::If;

                flowNode.condition = FlowTaskCondition::Nop;
                if x.condition.to_string() == "eq".to_string() {
                    flowNode.condition = FlowTaskCondition::Equals;
                } else
                if x.condition.to_string() == "lowereq".to_string() {
                    flowNode.condition = FlowTaskCondition::LowerEquals;
                } else
                if x.condition.to_string() == "lower".to_string() {
                    flowNode.condition = FlowTaskCondition::Lower;
                }
            }

            if x.mode.to_string() == "int".to_string() {
                flowNode.mode = FlowTaskMode::IntegerMode;
            } else
            if x.mode.to_string() == "float".to_string() {
                flowNode.mode = FlowTaskMode::FloatMode;
            } else
            if x.mode.to_string() == "string".to_string() {
                flowNode.mode = FlowTaskMode::StringMode;
            } else 
            if x.mode.to_string() == "".to_string() {
                flowNode.mode = FlowTaskMode::StringMode;
            }
            
            flowSteps.insert(x.name.to_string(), flowNode.clone());
            flow.push(flowNode.clone());
        }

        let mut startIndex : usize = usize::MAX;

        let mut index = 0;
        for x in &v.flow {
            match flowSteps.get(&x.next.to_string()) {
                Some(flowNode) => {
                    flow[index].next = flowNode.name;
                }
                None => {
                    flow[index].next = usize::MAX;
                }
            }
            match flowSteps.get(&x.elseStep.to_string()) {
                Some(flowNode) => {
                    flow[index].elseStep = flowNode.name;
                }
                None => {
                    flow[index].elseStep = usize::MAX;
                }
            }
            match flowSteps.get(&x.eventStepName.to_string()) {
                Some(flowNode) => {
                    flow[index].eventStepName = flowNode.name;
                }
                None => {
                    flow[index].eventStepName = usize::MAX;
                }
            }
            match flowSteps.get(&"start".to_string()) {
                Some(flowNode) => {
                    startIndex = flowNode.name;
                }
                None => {

                }
            }
            index = index + 1;

        }
        Flowrunner {
            flow: flow,
            parameters : parametersMap
        }
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}