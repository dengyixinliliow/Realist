import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ImageGallery from "../components/misc/ImageGallery";
import Logo from "../logo.svg";
import AdFeatures from "../components/cards/AdFeatures";
import { formatNumber } from "../components/helpers/ad";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LikeUnlike from '../components/misc/LikeUnlike';

dayjs.extend(relativeTime);

export default function AdView() {
  const params = useParams();

  const [ad, setAd] = useState({});
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (params?.slug) fetchAd();
  }, [params?.slug]);

  const fetchAd = async () => {
    try {
      const { data } = await axios.get(`/ad/${params.slug}`);
      setAd(data?.ad);
      setRelated(data?.related);
    } catch (err) {
      console.log(err);
    }
  };

  const generatePhotosArray = () => {
    if (ad?.photos?.length > 0) {
      const x = ad?.photos?.length === 1 ? 2 : 4;
      let arr = [];
      ad?.photos.map((p) => {
        arr.push({ src: p.Location, width: x, height: x });
      });
      return arr;
    } else {
      return [
        {
          src: Logo,
          width: 2,
          height: 1,
        },
      ];
    }
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-lg-4">
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary disabled mt-2">
                {ad?.type ? ad.type : ""} for {ad?.action ? ad.action : ""}
              </button>
              <LikeUnlike ad={ad}/>
            </div>
            <br />
            <div className="my-4">
              {ad?.sold ? "❌ Off Market" : "✅ In Market"}
            </div>
            <h1>{ad?.address}</h1>
            <AdFeatures ad={ad} />
            <h3 className="mt-3 h2">$ {formatNumber(ad?.price)}</h3>
            <p>{dayjs(ad?.createdAt).fromNow()}</p>
          </div>
          <div className="col-lg-8">
            <ImageGallery photos={generatePhotosArray()} />
          </div>
        </div>
      </div>

      <pre>{JSON.stringify({ ad, related }, null, 4)}</pre>
    </>
  );
}
