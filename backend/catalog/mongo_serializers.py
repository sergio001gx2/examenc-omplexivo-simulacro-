from rest_framework import serializers

class ServiceTypeSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    base_price = serializers.FloatField(required=False, default=0.0)
    is_active = serializers.BooleanField(default=True)

class VehicleServiceSerializer(serializers.Serializer):
    vehiculo_id = serializers.IntegerField()        # ID de Vehiculo (Postgres)
    service_type_id = serializers.CharField()       # ObjectId (string) de service_types
    date = serializers.DateField(required=False)    # No se envía desde el cliente; el backend asigna la fecha actual al crear
    kilometers = serializers.IntegerField(required=False, default=0)
    cost = serializers.FloatField(required=False, default=0.0)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
