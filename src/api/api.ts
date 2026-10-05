import axios from "axios";

const NASA_API_URL = "https://images-api.nasa.gov/search";

export interface NasaImage {
  id: string;
  title: string;
  date: string;
  center: string;
  description: string;
  imageUrl: string;
}

interface NasaResponse {
  collection: {
    items: {
      data: {
        nasa_id: string;
        title: string;
        date_created: string;
        center?: string;
        description?: string;
      }[];
      links?: {
        href: string;
        render?: string;
      }[];
    }[];
  };
}

export async function getImages(): Promise<NasaImage[]> {
  const response = await axios.get<NasaResponse>(NASA_API_URL, {
    params: {
      media_type: "image",
      page_size: 25,
    },
    timeout: 15000,
  });

  return response.data.collection.items
    .filter((item) => item.data.length > 0)
    .map((item) => {
      const data = item.data[0];

      return {
        id: data.nasa_id,
        title: data.title,
        date: data.date_created,
        center: data.center || "Unknown",
        description: data.description || "",
        imageUrl: item.links?.find((link) => link.render === "image")?.href || "",
      };
    });
}
