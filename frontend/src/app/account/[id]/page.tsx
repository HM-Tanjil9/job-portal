"use client";
import { user_service } from "@/context/AppContext";
import { User } from "@/type";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "@/components/loading";
import Info from "../components/info";

function UserAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  async function fetchUser() {
    const token = Cookies.get("token");
    const { data } = await axios.get(`${user_service}/api/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data);

    setUser(data);
    try {
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchUser();
  }, [id]);
  if (loading) return <Loading />;

  return (
    <>
      <div className="w-[90%] md:w-[60%] m-auto">
        <Info user={user} isYourAccount={false} />
      </div>
      ;
    </>
  );
}

export default UserAccount;
