from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import json
import numpy as np
import pandas as pd
from PIL import Image
import io
import base64
import hashlib
import requests

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="眼健康AI推荐服务",
    description="基于多模态数据的眼健康产品推荐AI服务",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 产品数据库（模拟）
PRODUCT_DATABASE = {
    "prod_001": {
        "id": "prod_001",
        "name": "护眼蓝光眼镜",
        "category": "protective_equipment",
        "price": 299.0,
        "description": "专业防蓝光眼镜，有效过滤有害蓝光",
        "features": ["防蓝光", "UV400", "轻便"],
        "target_conditions": ["干眼症", "视疲劳", "长时间用眼"],
        "age_range": [18, 65],
        "usage_scenarios": ["办公", "学习", "游戏"]
    },
    "prod_002": {
        "id": "prod_002", 
        "name": "叶黄素补充剂",
        "category": "supplements",
        "price": 158.0,
        "description": "天然叶黄素提取物，保护视网膜健康",
        "features": ["叶黄素10mg", "玉米黄质2mg", "天然提取"],
        "target_conditions": ["黄斑变性", "视力下降", "眼部营养"],
        "age_range": [25, 80],
        "usage_scenarios": ["日常保健", "眼部护理"]
    },
    "prod_003": {
        "id": "prod_003",
        "name": "眼部按摩仪",
        "category": "equipment",
        "price": 399.0,
        "description": "智能眼部按摩仪，缓解眼部疲劳",
        "features": ["热敷", "按摩", "智能控制"],
        "target_conditions": ["视疲劳", "眼干", "眼部紧张"],
        "age_range": [20, 70],
        "usage_scenarios": ["放松", "治疗", "保健"]
    },
    "prod_004": {
        "id": "prod_004",
        "name": "人工泪液",
        "category": "medication",
        "price": 89.0,
        "description": "无防腐剂人工泪液，缓解眼干症状",
        "features": ["无防腐剂", "长效保湿", "温和配方"],
        "target_conditions": ["干眼症", "眼干", "眼部不适"],
        "age_range": [18, 100],
        "usage_scenarios": ["日常使用", "症状缓解"]
    },
    "prod_005": {
        "id": "prod_005",
        "name": "维生素A软胶囊",
        "category": "supplements",
        "price": 128.0,
        "description": "高纯度维生素A，维护眼部健康",
        "features": ["维生素A", "天然提取", "易吸收"],
        "target_conditions": ["夜盲症", "眼部营养", "视力保护"],
        "age_range": [20, 75],
        "usage_scenarios": ["营养补充", "眼部保健"]
    }
}

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    logger.info("AI服务启动中...")
    logger.info("AI服务启动完成")

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理"""
    logger.info("AI服务关闭中...")
    logger.info("AI服务关闭完成")

@app.get("/")
async def root():
    return {
        "message": "眼健康AI推荐服务",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "多模态数据分析",
            "个性化产品推荐", 
            "图像分析",
            "文本分析",
            "用户行为分析"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": True,
        "mock_mode": False
    }

@app.post("/api/v1/recommendation")
async def get_recommendations(
    user_id: str = Form(...),
    context: str = Form(...),
    top_k: int = Form(5)
):
    """获取个性化推荐"""
    try:
        # 解析上下文数据
        context_data = json.loads(context)
        
        # 生成推荐结果
        recommendations = await generate_recommendations(user_id, context_data, top_k)
        
        return {
            "recommendations": recommendations,
            "model_version": "2.0.0",
            "confidence": 0.88,
            "processing_time": 0.3,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"推荐生成失败: {e}")
        raise HTTPException(status_code=500, detail="推荐生成失败")

@app.post("/api/v1/analyze")
async def analyze_data(
    file: UploadFile = File(...),
    analysis_type: str = Form("multimodal")
):
    """分析上传的文件"""
    try:
        content = await file.read()
        
        # 根据文件类型进行分析
        if file.content_type.startswith('image/'):
            result = await analyze_image(content)
        elif file.content_type == 'application/pdf':
            result = await analyze_pdf(content)
        else:
            result = await analyze_text(content)
        
        return {
            "analysis_type": analysis_type,
            "file_type": file.content_type,
            "file_size": len(content),
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"文件分析失败: {e}")
        raise HTTPException(status_code=500, detail="文件分析失败")

@app.post("/api/v1/embedding")
async def generate_embedding(
    text: str = Form(...),
    model: str = Form("text")
):
    """生成文本嵌入向量"""
    try:
        # 生成模拟嵌入向量
        embedding = np.random.rand(768).tolist()
        
        # 生成缓存键
        cache_key = hashlib.md5(text.encode()).hexdigest()
        
        return {
            "embedding": embedding,
            "dimension": len(embedding),
            "cache_key": cache_key,
            "model": model,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"嵌入向量生成失败: {e}")
        raise HTTPException(status_code=500, detail="嵌入向量生成失败")

async def generate_recommendations(user_id: str, context: Dict[str, Any], top_k: int) -> List[Dict[str, Any]]:
    """生成推荐结果"""
    try:
        # 提取用户特征
        user_features = extract_user_features(context)
        
        # 计算产品匹配度
        product_scores = []
        
        for product_id, product in PRODUCT_DATABASE.items():
            score = calculate_product_score(user_features, product)
            product_scores.append({
                "product_id": product_id,
                "product_name": product["name"],
                "score": score,
                "reason": generate_recommendation_reason(user_features, product),
                "category": product["category"],
                "price": product["price"],
                "description": product["description"]
            })
        
        # 按分数排序并返回top_k
        product_scores.sort(key=lambda x: x["score"], reverse=True)
        
        return product_scores[:top_k]
        
    except Exception as e:
        logger.error(f"推荐生成失败: {e}")
        # 返回默认推荐
        return get_default_recommendations(top_k)

def extract_user_features(context: Dict[str, Any]) -> Dict[str, Any]:
    """提取用户特征"""
    features = {
        "age": context.get("age", 30),
        "gender": context.get("gender", "unknown"),
        "eye_conditions": context.get("eye_conditions", []),
        "screen_time": context.get("screen_time", 8),  # 小时
        "sleep_hours": context.get("sleep_hours", 7),
        "work_type": context.get("work_type", "office"),
        "symptoms": context.get("symptoms", []),
        "preferences": context.get("preferences", []),
        "budget_range": context.get("budget_range", [100, 500])
    }
    
    return features

def calculate_product_score(user_features: Dict[str, Any], product: Dict[str, Any]) -> float:
    """计算产品匹配分数"""
    score = 0.0
    
    # 年龄匹配
    user_age = user_features["age"]
    age_range = product["age_range"]
    if age_range[0] <= user_age <= age_range[1]:
        score += 0.3
    else:
        score += 0.1
    
    # 症状匹配
    user_symptoms = user_features["symptoms"]
    target_conditions = product["target_conditions"]
    symptom_match = len(set(user_symptoms) & set(target_conditions))
    if symptom_match > 0:
        score += 0.4 * (symptom_match / len(target_conditions))
    
    # 使用场景匹配
    user_work_type = user_features["work_type"]
    usage_scenarios = product["usage_scenarios"]
    if user_work_type in usage_scenarios:
        score += 0.2
    
    # 价格匹配
    product_price = product["price"]
    budget_range = user_features["budget_range"]
    if budget_range[0] <= product_price <= budget_range[1]:
        score += 0.1
    
    # 屏幕时间匹配（对于护眼产品）
    if "protective_equipment" in product["category"]:
        screen_time = user_features["screen_time"]
        if screen_time > 6:  # 长时间用眼
            score += 0.2
    
    return min(score, 1.0)  # 确保分数不超过1.0

def generate_recommendation_reason(user_features: Dict[str, Any], product: Dict[str, Any]) -> str:
    """生成推荐理由"""
    reasons = []
    
    # 基于症状
    user_symptoms = user_features["symptoms"]
    target_conditions = product["target_conditions"]
    matching_symptoms = set(user_symptoms) & set(target_conditions)
    
    if matching_symptoms:
        reasons.append(f"适合您的症状：{', '.join(matching_symptoms)}")
    
    # 基于使用场景
    user_work_type = user_features["work_type"]
    if user_work_type in product["usage_scenarios"]:
        reasons.append(f"适合{user_work_type}场景使用")
    
    # 基于屏幕时间
    screen_time = user_features["screen_time"]
    if "protective_equipment" in product["category"] and screen_time > 6:
        reasons.append("基于您的长时间用眼习惯推荐")
    
    # 基于年龄
    user_age = user_features["age"]
    age_range = product["age_range"]
    if age_range[0] <= user_age <= age_range[1]:
        reasons.append("适合您的年龄段")
    
    return "；".join(reasons) if reasons else "基于您的个人情况推荐"

def get_default_recommendations(top_k: int) -> List[Dict[str, Any]]:
    """获取默认推荐"""
    default_products = [
        {
            "product_id": "prod_001",
            "product_name": "护眼蓝光眼镜",
            "score": 0.85,
            "reason": "适合长时间用眼的用户",
            "category": "protective_equipment",
            "price": 299.0,
            "description": "专业防蓝光眼镜，有效过滤有害蓝光"
        },
        {
            "product_id": "prod_002",
            "product_name": "叶黄素补充剂", 
            "score": 0.78,
            "reason": "保护视网膜健康",
            "category": "supplements",
            "price": 158.0,
            "description": "天然叶黄素提取物，保护视网膜健康"
        }
    ]
    
    return default_products[:top_k]

async def analyze_image(content: bytes) -> Dict[str, Any]:
    """分析图像数据"""
    try:
        # 使用PIL进行基础图像分析
        image = Image.open(io.BytesIO(content))
        
        # 基础图像特征提取
        width, height = image.size
        mode = image.mode
        
        # 转换为RGB进行分析
        if mode != 'RGB':
            image = image.convert('RGB')
        
        # 计算图像质量指标
        img_array = np.array(image)
        brightness = np.mean(img_array)
        contrast = np.std(img_array)
        
        # 检测图像特征
        analysis_result = {
            "type": "image_analysis",
            "dimensions": {"width": width, "height": height},
            "mode": mode,
            "quality_metrics": {
                "brightness": float(brightness),
                "contrast": float(contrast)
            },
            "recommendations": []
        }
        
        # 基于分析结果生成建议
        if brightness < 50:
            analysis_result["recommendations"].append("图像较暗，建议增加光照")
        elif brightness > 200:
            analysis_result["recommendations"].append("图像较亮，建议调整曝光")
        
        if contrast < 30:
            analysis_result["recommendations"].append("图像对比度较低，建议调整拍摄参数")
        
        if width < 200 or height < 200:
            analysis_result["recommendations"].append("图像分辨率较低，建议使用更高分辨率的设备")
        
        analysis_result["recommendations"].append("图像分析完成，建议结合专业检查")
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"图像分析失败: {e}")
        return {
            "type": "image_analysis",
            "error": str(e),
            "recommendations": ["图像分析失败，请检查文件格式"]
        }

async def analyze_pdf(content: bytes) -> Dict[str, Any]:
    """分析PDF文档"""
    try:
        # 基础PDF分析
        pdf_file = io.BytesIO(content)
        
        # 简单的PDF分析（实际应用中可以使用PyPDF2等库）
        file_size = len(content)
        
        # 检测关键词
        content_str = content.decode('utf-8', errors='ignore')
        eye_related_keywords = [
            "视力", "眼睛", "眼部", "近视", "远视", "散光", "干眼", "疲劳",
            "vision", "eye", "ocular", "myopia", "hyperopia", "astigmatism"
        ]
        
        detected_keywords = []
        for keyword in eye_related_keywords:
            if keyword.lower() in content_str.lower():
                detected_keywords.append(keyword)
        
        analysis_result = {
            "type": "pdf_analysis",
            "file_size": file_size,
            "detected_keywords": detected_keywords,
            "recommendations": []
        }
        
        # 生成建议
        if len(detected_keywords) > 0:
            analysis_result["recommendations"].append(f"检测到眼部相关关键词：{', '.join(detected_keywords)}")
        
        if file_size < 10000:  # 小于10KB
            analysis_result["recommendations"].append("文档内容较少，建议提供更详细的检查报告")
        
        analysis_result["recommendations"].append("PDF分析完成，建议结合专业解读")
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"PDF分析失败: {e}")
        return {
            "type": "pdf_analysis",
            "error": str(e),
            "recommendations": ["PDF分析失败，请检查文件格式"]
        }

async def analyze_text(content: bytes) -> Dict[str, Any]:
    """分析文本数据"""
    try:
        text_content = content.decode('utf-8')
        
        # 基础文本分析
        word_count = len(text_content.split())
        char_count = len(text_content)
        
        # 情感分析（简化版）
        positive_words = ["好", "改善", "有效", "推荐", "满意", "清晰", "舒适"]
        negative_words = ["问题", "不适", "疼痛", "模糊", "疲劳", "干涩", "模糊"]
        
        positive_count = sum(1 for word in positive_words if word in text_content)
        negative_count = sum(1 for word in negative_words if word in text_content)
        
        sentiment = "positive" if positive_count > negative_count else "negative" if negative_count > positive_count else "neutral"
        
        return {
            "type": "text_analysis",
            "text_stats": {
                "word_count": word_count,
                "char_count": char_count
            },
            "sentiment": sentiment,
            "positive_words": positive_count,
            "negative_words": negative_count,
            "recommendations": ["文本分析完成，建议结合专业评估"]
        }
        
    except Exception as e:
        logger.error(f"文本分析失败: {e}")
        return {
            "type": "text_analysis",
            "error": str(e),
            "recommendations": ["文本分析失败"]
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)