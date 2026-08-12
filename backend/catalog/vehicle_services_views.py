from datetime import date, datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId
from .mongo import db
from .mongo_serializers import VehicleServiceSerializer

col = db["vehicle_services"]

def fix_id(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    if doc and isinstance(doc.get("date"), (date, datetime)):
        doc["date"] = doc["date"].isoformat()
    return doc

def oid_or_none(id_str: str):
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def vehicle_services_list_create(request):
    if request.method == "GET":
        q = {}
        for k, v in request.query_params.items():
            if k == "vehiculo_id":
                try:
                    q[k] = int(v)
                except ValueError:
                    q[k] = v
            else:
                q[k] = v
        docs = [fix_id(d) for d in col.find(q)]
        return Response(docs)

    if not request.user or not request.user.is_authenticated:
        return Response({"detail": "Las credenciales de autenticación no se proveyeron."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = VehicleServiceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    data.setdefault("date", date.today().isoformat())  # fecha actual si no se provee

    res = col.insert_one(data)
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def vehicle_services_detail(request, id: str):
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
        serializer = VehicleServiceSerializer(data=request.data, partial=(request.method == "PATCH"))
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
