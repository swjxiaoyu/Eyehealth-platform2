package main

import (
	"encoding/json"
	"fmt"
	"time"
)

// SimpleTraceRecord 简单的溯源记录结构
type SimpleTraceRecord struct {
	ID           string    `json:"id"`
	ProductID    string    `json:"productId"`
	Stage        string    `json:"stage"`
	Issuer       string    `json:"issuer"`
	Timestamp    time.Time `json:"timestamp"`
	IsVerified   bool      `json:"isVerified"`
}

// SimpleProduct 简单的产品结构
type SimpleProduct struct {
	ID           string    `json:"id"`
	SKU          string    `json:"sku"`
	Name         string    `json:"name"`
	Manufacturer string    `json:"manufacturer"`
	CreatedAt    time.Time `json:"createdAt"`
	IsVerified   bool      `json:"isVerified"`
}

// SimpleChaincode 简单链码结构
type SimpleChaincode struct{}

// Init 初始化链码
func (scc *SimpleChaincode) Init(stub ChaincodeStubInterface) Response {
	return shim.Success(nil)
}

// Invoke 调用链码
func (scc *SimpleChaincode) Invoke(stub ChaincodeStubInterface) Response {
	function, args := stub.GetFunctionAndParameters()

	switch function {
	case "CreateTrace":
		return scc.createTrace(stub, args)
	case "GetTrace":
		return scc.getTrace(stub, args)
	case "CreateProduct":
		return scc.createProduct(stub, args)
	case "GetProduct":
		return scc.getProduct(stub, args)
	default:
		return shim.Error("Invalid function name")
	}
}

// CreateTrace 创建溯源记录
func (scc *SimpleChaincode) createTrace(stub ChaincodeStubInterface, args []string) Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	var trace SimpleTraceRecord
	err := json.Unmarshal([]byte(args[0]), &trace)
	if err != nil {
		return shim.Error("Failed to unmarshal trace data: " + err.Error())
	}

	// 设置时间戳和ID
	trace.Timestamp = time.Now()
	trace.ID = fmt.Sprintf("trace_%s_%d", trace.ProductID, trace.Timestamp.Unix())

	// 存储溯源记录
	traceJSON, err := json.Marshal(trace)
	if err != nil {
		return shim.Error("Failed to marshal trace: " + err.Error())
	}

	err = stub.PutState(trace.ID, traceJSON)
	if err != nil {
		return shim.Error("Failed to put trace: " + err.Error())
	}

	return shim.Success(traceJSON)
}

// GetTrace 获取溯源记录
func (scc *SimpleChaincode) getTrace(stub ChaincodeStubInterface, args []string) Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	traceID := args[0]
	traceJSON, err := stub.GetState(traceID)
	if err != nil {
		return shim.Error("Failed to read trace: " + err.Error())
	}

	if traceJSON == nil {
		return shim.Error("Trace not found: " + traceID)
	}

	return shim.Success(traceJSON)
}

// CreateProduct 创建产品
func (scc *SimpleChaincode) createProduct(stub ChaincodeStubInterface, args []string) Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	var product SimpleProduct
	err := json.Unmarshal([]byte(args[0]), &product)
	if err != nil {
		return shim.Error("Failed to unmarshal product data: " + err.Error())
	}

	// 设置时间戳和ID
	product.CreatedAt = time.Now()
	product.ID = fmt.Sprintf("product_%s_%d", product.SKU, product.CreatedAt.Unix())

	// 存储产品
	productJSON, err := json.Marshal(product)
	if err != nil {
		return shim.Error("Failed to marshal product: " + err.Error())
	}

	err = stub.PutState(product.ID, productJSON)
	if err != nil {
		return shim.Error("Failed to put product: " + err.Error())
	}

	return shim.Success(productJSON)
}

// GetProduct 获取产品信息
func (scc *SimpleChaincode) getProduct(stub ChaincodeStubInterface, args []string) Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	productID := args[0]
	productJSON, err := stub.GetState(productID)
	if err != nil {
		return shim.Error("Failed to read product: " + err.Error())
	}

	if productJSON == nil {
		return shim.Error("Product not found: " + productID)
	}

	return shim.Success(productJSON)
}

func main() {
	err := shim.Start(&SimpleChaincode{})
	if err != nil {
		fmt.Printf("Error starting SimpleChaincode: %s", err)
	}
}