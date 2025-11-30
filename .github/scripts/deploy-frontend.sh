#!/bin/bash
# Script de déploiement frontend pour Cinephoria

set -e

ENVIRONMENT=$1
S3_BUCKET=$2
CLOUDFRONT_ID=$3

echo "🚀 Déploiement du frontend Cinephoria vers $ENVIRONMENT..."
echo "📦 Bucket S3 : $S3_BUCKET"

# Vérifier que le dossier dist existe
if [ ! -d "./dist" ]; then
    echo "❌ Dossier dist/ non trouvé. Assurez-vous que l'application a été buildée."
    exit 1
fi

echo "📋 Contenu du dossier dist/:"
ls -la ./dist/

# Synchroniser les fichiers statiques avec cache long
echo "📤 Upload des fichiers statiques (cache long)..."
aws s3 sync ./dist/ s3://$S3_BUCKET/ \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.json" \
    --exclude "*.xml"

# Upload des fichiers HTML avec cache court
echo "📄 Upload des fichiers HTML (cache court)..."
aws s3 sync ./dist/ s3://$S3_BUCKET/ \
    --cache-control "no-cache, no-store, must-revalidate" \
    --include "index.html" \
    --include "*.json" \
    --include "*.xml"

# Upload des assets avec cache approprié
echo "🎨 Upload des assets..."
aws s3 sync ./dist/ s3://$S3_BUCKET/ \
    --cache-control "public, max-age=604800" \
    --include "*.css" \
    --include "*.js" \
    --include "*.png" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.gif" \
    --include "*.svg" \
    --include "*.ico" \
    --include "*.woff" \
    --include "*.woff2" \
    --include "*.ttf"

# Vérifier le contenu du bucket après déploiement
echo "🔍 Vérification du contenu du bucket..."
aws s3 ls s3://$S3_BUCKET/ --recursive --human-readable --summarize

# Invalider le cache CloudFront si l'ID est fourni
if [ -n "$CLOUDFRONT_ID" ]; then
    echo "🔄 Invalidation du cache CloudFront..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "⏳ Invalidation en cours (ID: $INVALIDATION_ID)..."
    
    # Attendre la complétion de l'invalidation
    aws cloudfront wait invalidation-completed \
        --distribution-id $CLOUDFRONT_ID \
        --id $INVALIDATION_ID
    
    echo "✅ Cache CloudFront invalidé avec succès"
else
    echo "⚠️  Aucun ID CloudFront fourni, skip de l'invalidation"
fi

echo "✅ Frontend déployé avec succès sur $ENVIRONMENT!"
echo "🌐 URL d'accès :"
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "   - https://staging.cinephoria.eu"
else
    echo "   - https://www.cinephoria.eu"
fi