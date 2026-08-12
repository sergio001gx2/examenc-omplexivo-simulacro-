from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId
from .mongo import db
from .mongo_serializers import ServiceTypeSerializer

col = db["service_types"]

def fix_id(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def oid_or_none(id_str: str):
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def service_types_list_create(request):
    if request.method == "GET":
        q = {}
        for k, v in request.query_params.items():
            if v.lower() == "true":
                q[k] = True
            elif v.lower() == "false":
                q[k] = False
            else:
                q[k] = v
        docs = [fix_id(d) for d in col.find(q)]
        return Response(docs)

    # POST requires auth check if desired or IsAuthenticated
    if not request.user or not request.user.is_authenticated:
        return Response({"detail": "Las credenciales de autenticación no se proveyeron."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = ServiceTypeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    res = col.insert_one(serializer.validated_data)
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def service_types_detail(request, id: str):
    _id = oid_or_none(id)
    if _id is None:
        return Response({"detail": "id inválido"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    if not request.user or not request.user.is_authenticated:
        return Response({"detail": "Las credenciales de autenticación no se proveyeron."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = ServiceTypeSerializer(data=request.data, partial=(request.method == "PATCH"))
        serializer.is_valid(raise_exception=True)

        col.update_one({"_id": _id}, {"$set": serializer.validated_data})
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    res = col.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)
