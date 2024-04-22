import axios from "axios";
import Resizer from "react-image-file-resizer";
import { Avatar } from "antd";

export default function ImageUpload({ ad, setAd }) {
  const handleUpload = async (e) => {
    try {
      let { files } = e.target;
      files = [...files];
      if (files.length) {
        setAd({ ...ad, uploading: true });
      }
      files.map((file) => {
        new Promise(() =>
          Resizer.imageFileResizer(
            file,
            300,
            300,
            "JPEG",
            100,
            0,
            async (uri) => {
              const { data } = await axios.post("/upload-image", {
                image: uri,
              });
              setAd((prev) => ({
                ...prev,
                photos: [data, ...prev.photos],
                uploading: false,
              }));
            },
            "base64"
          )
        );
      });
    } catch (err) {
      setAd({ ...ad, uploading: false });
      console.log(err);
    }
  };
  const handleDelete = async (file) => {
    const answer = window.confirm("delete image?");
    if (!answer) return;
    try {
      setAd({ ...ad, uploading: true });
      const { data } = await axios.post("/remove-image", file);
      if (data?.ok) {
        setAd((prev) => ({
          ...prev,
          photos: prev.photos.filter((p) => p.Key !== file.Key),
          uploading: false,
        }));
      }
    } catch (err) {
      setAd({ ...ad, uploading: false });
      console.log(err);
    }
  };
  return (
    <>
      <label className="btn btn-secondary mb-4">
        {ad.uploading ? "Loading" : "Upload Photos"}
        <input
          onChange={handleUpload}
          type="file"
          accept="image/*"
          multiple
          hidden
        />
      </label>

      {ad.photos.map((file, index) => {
        return (
          <Avatar
            src={file?.Location}
            key={index}
            shape="square"
            size="46"
            className="mx-1 mb-4"
            onClick={() => handleDelete(file)}
          />
        );
      })}
    </>
  );
}
