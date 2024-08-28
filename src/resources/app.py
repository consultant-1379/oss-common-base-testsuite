from minio import Minio
from minio.error import InvalidResponseError, S3Error
from flask import Flask, jsonify, request, make_response
import urllib3
app = Flask(__name__)

@app.route('/createBucket/<name>', methods = ['POST'])
def createBucket(name):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	try:
		client.make_bucket(name)
	except S3Error as err:
		if str(err.code) in ['BucketAlreadyOwnedByYou', 'BucketAlreadyExists']:
			pass
		else:
			raise

	#Check if bucket was created properly.
	found = client.bucket_exists(name)
	if not found:
		response = "Bucket NOT Created"
		response_code = 500
	else:
		response = "Bucket Created"
		response_code = 200

	return make_response(response, response_code)

@app.route('/listBuckets/', methods = ['POST'])
def listBuckets():
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	print("list buckets")
	buckets = client.list_buckets()
	listName = []
	for bucket in buckets:
		print(bucket.name, bucket.creation_date)
		listName.append(bucket.name)

	data = {"buckets" : listName}
	#return make_response(data, 200)
	return data

@app.route('/listObjects/<name>', methods = ['POST'])
def listObjects(name):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	print("list objects")
	objects = client.list_objects(name)
	listName = ""
	for obj in objects:
		print(obj.bucket_name, obj.object_name, obj.last_modified, obj.etag, obj.size, obj.content_type)
		listName += obj.object_name + " "

	return make_response(listName, 200)

@app.route('/uploadObject/<name>/<objectName>/<fileName>', methods = ['POST'])
def uploadObjects(name, objectName, fileName):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	response = client.fput_object(name, objectName, fileName + ".txt")
	if response.object_name == objectName:
		response = response.object_name + " created"
		response_code = 200
	else:
		response = "Object NOT Created"
		response_code = 500

	return make_response(response, response_code)

@app.route('/downloadObject/<name>/<objectName>/<fileName>', methods = ['POST'])
def downloadObjects(name, objectName, fileName):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	response = client.fget_object(name, objectName, fileName + ".txt")
	if response.object_name == objectName:
		response = response.object_name + " downloaded"
		response_code = 200
	else:
		response = "Object NOT downloaded"
		response_code = 500

	return make_response(response, response_code)

@app.route('/removeObject/<name>/<objectName>', methods = ['POST'])
def removeObject(name, objectName):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	client.remove_object(name, objectName)

	return make_response(objectName + " no more present in bucket", 200)

@app.route('/removeObjects/<name>', methods = ['POST'])
def removeObjects(name):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	objects = client.list_objects(name)
	listName = ""
	for obj in objects:
		response = client.remove_object(name, obj.object_name)

	return make_response("All Objects Deleted", 200)

@app.route('/deleteBucket/<name>', methods = ['POST'])
def removeBucket(name):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	#No need to check if bucket exists for our purpose
	#if bucket doesn't exist remove_bucket() throws an exception of type S3Error NoSuchBucket with code 500
	response = client.remove_bucket(name)
#	found = client.bucket_exists(name)
#	if not found:
#		response = "Bucket Deleted"
#		response_code = 200
#	else:
#		response = "Bucket NOT Deleted"
#		response_code = 500

	return make_response("Bucket deleted", 200)

@app.route('/test_minio/<name>', methods = ['POST'])
def minioExample(name):
	httpClient = urllib3.PoolManager(
		cert_reqs='CERT_NONE'
		#cert_reqs='CERT_REQUIRED',
		#ca_certs='intermediate-ca.crt'
		)
	client = Minio(
		request.get_json().get("bdr_url"),
		access_key = request.get_json().get("accesskey"),
		secret_key = request.get_json().get("secretkey"),
		session_token = request.get_json().get("sessiontoken"),
		secure=True,
		http_client=httpClient,
		)

	# Make 'asiatrip' bucket if not exist.
	found = client.bucket_exists(name)
	if not found:
		response = "NOT FOUND"
		print("Bucket " + name + " does not exists")
		response = client.make_bucket(name)
		print("Bucket " + name + " created")
		print(response)
	else:
		print("Bucket " + name + " already exists")
		response = "FOUND"

	listbucket=client.list_buckets()
	print("list bucket")
	print(listbucket)
	response = client.fput_object(name, "minio_file", "minio_file.txt")
	print("fput operation")
	print(response.object_name)

	response = client.stat_object(name, "minio_file")
	print("Stat object")
	print(response.object_name)

	print("list objects")
	objects = client.list_objects(name)
	for obj in objects:
		print(obj.bucket_name, obj.object_name, obj.last_modified, obj.etag, obj.size, obj.content_type)
		response = client.remove_object(name, obj.object_name)
		print("removing object response")
		print(response)
	print("list objects after deleting objects")
	objects = client.list_objects(name)
	response = client.remove_bucket(name)
	print("Removing Bucket : ", name + " : is existing: " + str(client.bucket_exists(name)))
	print(response)

	return make_response("All operations OK", 200)


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8000)