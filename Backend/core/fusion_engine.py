# core/fusion_engine.py
# Emotion fusion algorithm

import numpy as np

def fuse_emotions_numpy(predictions, weights):
    all_labels = sorted({
        label
        for scores in predictions.values()
        if scores
        for label in scores
    })
    
    if not all_labels:
        return {}
    
    score_matrix = []
    weight_matrix = []
    
    for modality, scores in predictions.items():
        modality_weight = weights.get(modality, 0)
        modality_scores = [
            scores.get(label, 0) if scores else 0
            for label in all_labels
        ]
        score_matrix.append(modality_scores)
        weight_matrix.append([modality_weight] * len(all_labels))
    
    score_matrix = np.array(score_matrix, dtype=np.float32)
    weight_matrix = np.array(weight_matrix, dtype=np.float32)
    
    weighted_sum = np.sum(score_matrix * weight_matrix, axis=0)
    total_weight = np.sum(weight_matrix, axis=0)
    
    fused_scores = {
        label: float(weighted_sum[i] / total_weight[i] if total_weight[i] > 0 else 0)
        for i, label in enumerate(all_labels)
    }
    
    return fused_scores
